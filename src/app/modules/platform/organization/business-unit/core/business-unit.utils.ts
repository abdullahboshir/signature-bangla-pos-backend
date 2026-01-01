// ============================================================================
// FILE 3: src/app/modules/organization/business-unit/schemas/business-unit.methods.ts
// ============================================================================
// Extract from your current business-unit.model.ts and move here

import { Types } from "mongoose";
import type { IBusinessUnitCoreDocument, IBusinessUnitCoreModel } from "./business-unit.interface.ts";


/**
 * Instance Methods - Called on individual documents
 */
export function attachInstanceMethods(schema: any) {
  // ====== PERFORMANCE & METRICS ======
  schema.methods.updatePerformanceMetrics = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<void> {
    const overallScore =
      (this.performance.responseRate +
        this.performance.fulfillmentRate +
        this.performance.onTimeDeliveryRate +
        this.performance.customerSatisfaction * 20 +
        this.performance.productQualityScore * 20) /
      5;

    this.performance.overallScore = Math.round(overallScore);
    await this.save();
  };

  schema.methods.updateStatistics = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<void> {
    // This would update statistics from actual order and product data
    await this.save();
  };

  // ====== STATUS MANAGEMENT ======
  schema.methods.publish = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<void> {
    this.status = "published";
    this.publishedAt = new Date();
    await this.save();
  };

  schema.methods.unpublish = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<void> {
    this.status = "draft";
    await this.save();
  };

  schema.methods.deactivate = async function (
    this: IBusinessUnitCoreDocument,
    _reason: string
  ): Promise<void> {
    this.status = "suspended";
    await this.save();
  };

  schema.methods.activate = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<void> {
    this.status = "published";
    await this.save();
  };

  // ====== PRODUCT MANAGEMENT ======
  schema.methods.addProduct = async function (
    this: IBusinessUnitCoreDocument,
    _productId: Types.ObjectId
  ): Promise<void> {
    this.statistics.totalProducts += 1;
    this.statistics.activeProducts += 1;
    await this.save();
  };

  schema.methods.removeProduct = async function (
    this: IBusinessUnitCoreDocument,
    _productId: Types.ObjectId
  ): Promise<void> {
    this.statistics.totalProducts = Math.max(
      0,
      this.statistics.totalProducts - 1
    );
    this.statistics.activeProducts = Math.max(
      0,
      this.statistics.activeProducts - 1
    );
    await this.save();
  };

  // ====== FINANCIAL CALCULATIONS ======
  schema.methods.calculateBusinessUnitCommission = function (
    this: IBusinessUnitCoreDocument
  ): number {
    return this.statistics.totalRevenue * 0.1; // 10% commission
  };

  // ====== STATISTICS RETRIEVAL ======
  schema.methods.getProductStats = async function (
    this: IBusinessUnitCoreDocument
  ): Promise<any> {
    return {
      total: this.statistics.totalProducts,
      active: this.statistics.activeProducts,
      categories: this.categories.length,
    };
  };

  schema.methods.getOrderStats = async function (
    this: IBusinessUnitCoreDocument,
    timeframe: "daily" | "weekly" | "monthly" | "yearly"
  ): Promise<any> {
    return {
      timeframe,
      orders: this.statistics.totalOrders,
      revenue: this.statistics.totalRevenue,
      averageOrderValue: this.statistics.averageOrderValue,
    };
  };
}

/**
 * Static Methods - Called on the Model itself
 */
export function attachStaticMethods(schema: any) {
  // ====== SEARCH & FILTER ======
  schema.statics.findFeaturedBusinessUnits = function (
    this: IBusinessUnitCoreModel,
    limit: number = 12
  ): Promise<IBusinessUnitCoreDocument[]> {
    return this.find({
      isFeatured: true,
      status: "published",
      visibility: "public",
      $or: [
        { featuredExpiresAt: { $exists: false } },
        { featuredExpiresAt: { $gte: new Date() } },
      ],
    })
      .populate("vendor", "businessInfo.legalName businessInfo.tradeName")
      .populate("primaryCategory", "name slug")
      .limit(limit)
      .sort({ "ratings.average": -1, "statistics.totalRevenue": -1 });
  };

  schema.statics.findBusinessUnitsByCategory = function (
    this: IBusinessUnitCoreModel,
    categoryId: Types.ObjectId
  ): Promise<IBusinessUnitCoreDocument[]> {
    return this.find({
      categories: categoryId,
      status: "published",
      visibility: "public",
    })
      .populate("vendor", "businessInfo.legalName")
      .populate("primaryCategory", "name slug")
      .sort({ "ratings.average": -1, "statistics.totalRevenue": -1 });
  };

  schema.statics.findBusinessUnitsByVendor = function (
    this: IBusinessUnitCoreModel,
    vendorId: Types.ObjectId
  ): Promise<IBusinessUnitCoreDocument[]> {
    return this.find({ vendor: vendorId })
      .populate("primaryCategory", "name slug")
      .sort({ createdAt: -1 });
  };

  schema.statics.searchBusinessUnits = function (
    this: IBusinessUnitCoreModel,
    query: string,
    filters: any = {}
  ): Promise<IBusinessUnitCoreDocument[]> {
    const searchFilter: any = {
      $text: { $search: query },
      status: "published",
      visibility: "public",
    };

    if (filters.categories)
      searchFilter.categories = { $in: filters.categories };
    if (filters.operationalModel)
      searchFilter.operationalModel = filters.operationalModel;
    if (filters.industry)
      searchFilter.industry = filters.industry;
    if (filters.minRating)
      searchFilter["ratings.average"] = { $gte: filters.minRating };

    return this.find(searchFilter)
      .populate("vendor", "businessInfo.legalName businessInfo.tradeName")
      .populate("primaryCategory", "name slug")
      .sort({
        score: { $meta: "textScore" },
        "ratings.average": -1,
      })
      .limit(filters.limit || 20);
  };

  schema.statics.findTopPerformingBusinessUnits = function (
    this: IBusinessUnitCoreModel,
    limit: number = 10
  ): Promise<IBusinessUnitCoreDocument[]> {
    return this.find({
      status: "published",
      visibility: "public",
      "statistics.totalOrders": { $gt: 0 },
    })
      .populate("vendor", "businessInfo.legalName")
      .populate("primaryCategory", "name slug")
      .limit(limit)
      .sort({
        "performance.overallScore": -1,
        "statistics.totalRevenue": -1,
      });
  };

  schema.statics.findNewBusinessUnits = function (
    this: IBusinessUnitCoreModel,
    limit: number = 10
  ): Promise<IBusinessUnitCoreDocument[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.find({
      status: "published",
      visibility: "public",
      createdAt: { $gte: thirtyDaysAgo },
    })
      .populate("vendor", "businessInfo.legalName")
      .populate("primaryCategory", "name slug")
      .limit(limit)
      .sort({ createdAt: -1 });
  };

  schema.statics.findBusinessUnitsNeedingAttention = function (
    this: IBusinessUnitCoreModel
  ): Promise<IBusinessUnitCoreDocument[]> {
    return this.find({
      status: "published",
      $or: [
        { "performance.overallScore": { $lt: 60 } },
        { "ratings.average": { $lt: 3.0 } },
        { "statistics.activeProducts": 0 },
        {
          "statistics.totalOrders": 0,
          createdAt: {
            $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      ],
    })
      .populate("vendor", "businessInfo.legalName contact.email")
      .limit(50);
  };

  // ====== ANALYTICS & STATISTICS ======
  schema.statics.getBusinessUnitStats = async function (
    this: IBusinessUnitCoreModel,
    businessUnitId: Types.ObjectId
  ): Promise<any> {
    return this.aggregate([
      { $match: { _id: businessUnitId } },
      {
        $project: {
          businessUnitName: "$branding.name",
          vendor: 1,
          status: 1,
          totalProducts: "$statistics.totalProducts",
          activeProducts: "$statistics.activeProducts",
          totalOrders: "$statistics.totalOrders",
          totalRevenue: "$statistics.totalRevenue",
          averageRating: "$ratings.average",
          performanceScore: "$performance.overallScore",
          daysActive: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24,
            ],
          },
        },
      },
    ]);
  };

  schema.statics.getCategoryBusinessUnitStats = async function (
    this: IBusinessUnitCoreModel,
    categoryId: Types.ObjectId
  ): Promise<any> {
    return this.aggregate([
      { $match: { categories: categoryId, status: "published" } },
      {
        $group: {
          _id: "$primaryCategory",
          totalBusinessUnits: { $sum: 1 },
          averageRating: { $avg: "$ratings.average" },
          totalProducts: { $sum: "$statistics.totalProducts" },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
        },
      },
    ]);
  };

  schema.statics.getVendorBusinessUnitStats = async function (
    this: IBusinessUnitCoreModel,
    vendorId: Types.ObjectId
  ): Promise<any> {
    return this.aggregate([
      { $match: { vendor: vendorId } },
      {
        $group: {
          _id: "$status",
          businessUnitCount: { $sum: 1 },
          totalProducts: { $sum: "$statistics.totalProducts" },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
          averageRating: { $avg: "$ratings.average" },
        },
      },
    ]);
  };

  schema.statics.getPlatformBusinessUnitStats = async function (
    this: IBusinessUnitCoreModel
  ): Promise<any> {
    return this.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: null,
          totalBusinessUnits: { $sum: 1 },
          featuredBusinessUnits: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          verifiedBusinessUnits: { $sum: { $cond: ["$isVerified", 1, 0] } },
          averageRating: { $avg: "$ratings.average" },
          totalProducts: { $sum: "$statistics.totalProducts" },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
        },
      },
    ]);
  };

  schema.statics.calculateBusinessUnitGrowthMetrics = async function (
    this: IBusinessUnitCoreModel
  ): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.aggregate([
      {
        $match: {
          status: "published",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newBusinessUnits: { $sum: 1 },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  };
}