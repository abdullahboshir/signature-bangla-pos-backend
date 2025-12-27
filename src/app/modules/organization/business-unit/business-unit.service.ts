// ============================================================================
// FILE: src/app/modules/organization/business-unit/business-unit.service.ts
// ============================================================================

import { startSession } from "mongoose";
import { log } from "@core/utils/logger.ts";

import { ULIDGenerator } from "@core/utils/generateULID.ts";
import { sendImageToCloudinary } from "@core/utils/file-upload.ts";

import BusinessUnit from "./business-unit.model.ts";
import type { IBusinessUnitCore, IBusinessUnitCoreDocument } from "./business-unit.interface.ts";
import AppError from "@shared/errors/app-error.ts";
import { generateIncreament, makeSlug } from "@core/utils/utils.common.ts";
import { User } from "@app/modules/iam/user/user.model.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { Role } from "@app/modules/iam/role/role.model.ts";
import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import { CacheManager } from "../../../../core/utils/caching/cache-manager.js";


/**
 * Business Unit Service
 * Handles all business logic for business units
 */
export class BusinessUnitService {

  static async createBusinessUnit(
    businessUnitData: IBusinessUnitCore,
  ): Promise<IBusinessUnitCoreDocument> {
    console.log('businessUnitData', businessUnitData)
    const session = await startSession();
    try {

      session.startTransaction();
      const slug = await this.generateUniqueSlug(
        businessUnitData?.branding?.name,
        session
      );

      if (!businessUnitData.id) {
        const businessUnitId = ULIDGenerator.generateOutletId("BU");
        log.debug("Generated business unit ID", { businessUnitId });
        businessUnitData.id = businessUnitId;
      }
      businessUnitData.slug = slug;

      const [createdBusinessUnit] = await BusinessUnit.create(
        [businessUnitData],
        { session }
      );

      if (!createdBusinessUnit) {
        throw new AppError(
          500,
          "Failed to create business unit",
          "BU_CREATE_001"
        );
      }

      const superAdminRole = await Role.findOne({ name: USER_ROLE.SUPER_ADMIN }).session(session);
      if (!superAdminRole) {
        throw new AppError(
          500,
          "Failed to find super admin role",
          "BU_CREATE_003"
        );
      }


      const addToAdmin = await User.findOneAndUpdate(
        {
          roles: { $in: [superAdminRole._id] },
        }, { $addToSet: { businessUnits: createdBusinessUnit._id } }).session(session);

      if (!addToAdmin) {
        throw new AppError(
          500,
          "Failed to add business unit to super admin",
          "BU_CREATE_002"
        );
      }

      if (session.inTransaction()) {
        await session.commitTransaction();
      }

      return createdBusinessUnit;

    } catch (error: any) {

      if (session.inTransaction()) {
        await session.abortTransaction();
        log.warn("Transaction aborted due to error", { error: error.message });
      }

      log.error("❌ Business unit creation failed", {
        message: error.message,
        code: error.code,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        `Failed to create business unit: ${error.message}`,
        "BU_CREATE_002"
      );

    } finally {
      await session.endSession();
    }
  }


  private static async generateUniqueSlug(
    businessName: string,
    session: any
  ): Promise<string> {
    try {
      // Check if business unit with this name already exists
      const existingBusinessUnit = await BusinessUnit.findOne({
        "branding.name": businessName,
      }).session(session);

      if (!existingBusinessUnit) {
        // First instance, use base slug
        return makeSlug(businessName);
      }

      // Find all related slugs to get the highest increment
      const relatedBusinessUnits = await BusinessUnit.find({
        "branding.name": businessName,
      })
        .sort({ createdAt: -1 })
        .session(session);

      if (relatedBusinessUnits.length === 0) {
        return makeSlug(businessName);
      }


      // Extract increment from last slug (e.g., "business-name-2" -> "2")
      const lastSlug = relatedBusinessUnits[0]?.slug;
      const lastIncrement = lastSlug?.split("-").pop();

      // Generate next increment
      const nextIncrement = generateIncreament(lastIncrement);
      const newSlug = makeSlug(`${businessName} ${nextIncrement}`);

      log.debug("Generated unique slug", { businessName, newSlug });

      return newSlug;

    } catch (error: any) {
      log.error("Failed to generate unique slug", { error: error.message });
      throw new AppError(
        500,
        "Failed to generate unique slug",
        "BU_SLUG_001"
      );
    }
  }

  /**
   * Upload banner image to Cloudinary
   * 
   * @param businessUnitData - Business unit data object
   * @param file - Multer file object
   * @param businessUnitId - ID of the business unit
   */
  private static async uploadBannerImage(
    businessUnitData: IBusinessUnitCore,
    file: Express.Multer.File,
    businessUnitId: string
  ): Promise<void> {
    try {
      const imgName = `${businessUnitData.branding.name || Date.now()}-${businessUnitId}`;
      const imgPath = file.path;

      log.debug("Uploading banner image to Cloudinary", { imgName, imgPath });

      const { secure_url } = (await sendImageToCloudinary(
        imgName,
        imgPath
      )) as any;

      businessUnitData.branding.banner = secure_url;

      log.info("✅ Banner image uploaded successfully", { url: secure_url });

    } catch (uploadError: any) {
      log.error("Image upload failed", { error: uploadError.message });
      // Don't throw - continue without image
      // Image upload is optional, don't block business unit creation
    }
  }

  /**
   * Get business unit by ID
   * 
   * @param businessUnitId - Business unit ID
   * @returns Business unit document or null
   */
  static async getBusinessUnitById(
    idOrSlug: string
  ): Promise<IBusinessUnitCoreDocument | null> {
    return await CacheManager.wrap(`businessUnit:${idOrSlug}`, async () => {
      try {
        // Check if it's a valid ObjectId (hex string of 24 chars)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);

        const query = isObjectId
          ? { _id: idOrSlug }
          : { $or: [{ slug: idOrSlug }, { id: idOrSlug }] };

        const businessUnit = await BusinessUnit.findOne(query)
          .populate("attributeGroup")
          .populate("attributeGroups");

        return businessUnit;

      } catch (error: any) {
        log.error("Failed to fetch business unit", { error: error.message });
        throw new AppError(
          500,
          "Failed to fetch business unit",
          "BU_FETCH_001"
        );
      }
    }, 60); // 60s TTL
  }


  static async getBusinessUnitsByVendor(vendorId: any) {
    try {
      const businessUnits = await BusinessUnit.findBusinessUnitsByVendor(
        vendorId
      );

      return businessUnits;

    } catch (error: any) {
      log.error("Failed to fetch vendor business units", {
        error: error.message,
        vendorId,
      });
      throw new AppError(
        500,
        "Failed to fetch vendor business units",
        "BU_FETCH_002"
      );
    }
  }


  static async updateBusinessUnit(
    businessUnitId: string,
    updateData: Partial<IBusinessUnitCore>
  ): Promise<IBusinessUnitCoreDocument | null> {
    try {
      const flattenUpdateData = (data: any, prefix = '') => {
        return Object.keys(data).reduce((acc: any, key: string) => {
          const pre = prefix.length ? prefix + '.' : '';
          if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
            Object.assign(acc, flattenUpdateData(data[key], pre + key));
          } else {
            acc[pre + key] = data[key];
          }
          return acc;
        }, {});
      };

      const flattenedData = flattenUpdateData(updateData);

      const updatedBusinessUnit = await BusinessUnit.findByIdAndUpdate(
        businessUnitId,
        flattenedData,
        { new: true, runValidators: true }
      );

      if (!updatedBusinessUnit) {
        throw new AppError(
          404,
          "Business unit not found",
          "BU_UPDATE_001"
        );
      }

      log.info("✅ Business unit updated successfully", { businessUnitId });

      return updatedBusinessUnit;

    } catch (error: any) {
      log.error("Failed to update business unit", { error: error.message });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Failed to update business unit",
        "BU_UPDATE_002"
      );
    }
  }

  /**
   * Publish business unit (make it public)
   * 
   * @param businessUnitId - Business unit ID
   * @returns Updated business unit document
   */
  static async publishBusinessUnit(
    businessUnitId: string
  ): Promise<IBusinessUnitCoreDocument | null> {
    try {
      const businessUnit = await BusinessUnit.findById(businessUnitId);

      if (!businessUnit) {
        throw new AppError(404, "Business unit not found", "BU_PUBLISH_001");
      }

      await businessUnit.publish();

      log.info("✅ Business unit published", { businessUnitId });

      return businessUnit;

    } catch (error: any) {
      log.error("Failed to publish business unit", {
        error: error.message,
        businessUnitId,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Failed to publish business unit",
        "BU_PUBLISH_002"
      );
    }
  }

  static async getAllBusinessUnits(query: Record<string, unknown> = {}): Promise<any> {
    try {
      // 1. Resolve Business Unit Logic
      // Usually BUs are not filtered by BU (they ARE the BU), but maybe if hierarchical?
      // For now, standard filter is enough.

      // 2. Build Query
      const buQuery = new QueryBuilder(BusinessUnit.find(), query)
        .search(['branding.name', 'slug'])
        .filter()
        .sort()
        .paginate()
        .fields();

      const result = await buQuery.modelQuery;
      const meta = await buQuery.countTotal();

      return {
        meta,
        result
      };
    } catch (error: any) {
      log.error("Failed to fetch all business units", { error: error.message });
      throw new AppError(500, "Failed to fetch all business units", "BU_FETCH_ALL_001");
    }
  }

  static async deleteBusinessUnit(businessUnitId: string): Promise<void> {
    try {
      const result = await BusinessUnit.findByIdAndDelete(businessUnitId);

      if (!result) {
        throw new AppError(404, "Business unit not found", "BU_DELETE_001");
      }

      log.info("✅ Business unit deleted", { businessUnitId });

    } catch (error: any) {
      log.error("Failed to delete business unit", {
        error: error.message,
        businessUnitId,
      });

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Failed to delete business unit",
        "BU_DELETE_002"
      );
    }
  }

  /**
   * Get Dashboard Stats for Business Unit
   */
  static async getDashboardStats(businessUnitId: string, outletId?: string) {
    try {
      // Import dynamically to avoid circular dependency if Order imports BU
      const { Order } = await import("@app/modules/sales/order/order.model.ts");
      const { User } = await import("@app/modules/iam/user/user.model.ts"); // Assuming usage for user count

      const matchStage: any = { businessUnit: new (await import("mongoose")).Types.ObjectId(businessUnitId) };
      if (outletId && outletId !== 'all') {
        matchStage.outlet = new (await import("mongoose")).Types.ObjectId(outletId);
      }

      // 1. Total Revenue & Sales Count
      const revenueStats = await Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalSales: { $count: {} }
          }
        }
      ]);

      // 2. Active Users (Mock logic or check users assigned to this BU)
      // Since User model has businessUnits array, we can count users with this BU
      const activeUsers = await User.countDocuments({
        businessUnits: businessUnitId,
        isActive: true // Assuming there's an isActive field
      });
      // Or if no isActive, just count:
      // const activeUsers = await User.countDocuments({ businessUnits: businessUnitId });


      // 3. Growth (Mock for now or compare with last month)
      // Let's just return 0 for growth for now or calculate simple MoM

      return {
        revenue: revenueStats[0]?.totalRevenue || 0,
        activeSales: revenueStats[0]?.totalSales || 0,
        activeUsers: activeUsers || 0,
        growth: 0 // TODO: Implement growth logic
      };

    } catch (error: any) {
      log.error("Failed to get dashboard stats", { error: error.message });
      throw new AppError(500, "Failed to get dashboard stats", "BU_STATS_001");
    }
  }
}