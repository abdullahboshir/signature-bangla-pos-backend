import status from "http-status";

import {
  createCategoryService,
  getCategoriesService,
} from "./category.service.js";
// import BusinessUnit from "../../organization/business-unit/business-unit.model.ts";
import mongoose from "mongoose";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

export const createCategoryController = catchAsync(async (req, res) => {
  let { businessUnit } = req.body;
  if (typeof businessUnit === "string") {
    businessUnit = businessUnit.trim();
  }

  // Resolve Business Unit ID if it's a custom string ID (e.g., "STR_...")
  const isObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

  if (businessUnit && !isObjectId) {
    const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
    const allCount = await BusinessUnit.countDocuments();
    const bu = await BusinessUnit.findOne({
      $or: [{ id: businessUnit }, { slug: businessUnit }]
    });

    if (!bu) {
      return ApiResponse.success(res, {
        success: false,
        statusCode: status.NOT_FOUND,
        message: `BU Not Found. Input: '${businessUnit}'. Total BUs: ${allCount}.`,
        data: null,
      });
    }
    businessUnit = bu._id;
  }

  const data = await createCategoryService({ ...req.body, businessUnit });

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: " Category has been Created Successfully",
    data,
  });
});

export const getCategoriesController = catchAsync(async (req, res) => {
  const { businessUnitId } = req.params;

  let objectId: any = null;

  if (businessUnitId && businessUnitId !== "null") {
    if (mongoose.Types.ObjectId.isValid(businessUnitId)) {
      objectId = new mongoose.Types.ObjectId(businessUnitId);
    } else {
      if (businessUnitId && businessUnitId !== "null") {
        if (mongoose.Types.ObjectId.isValid(businessUnitId)) {
          objectId = new mongoose.Types.ObjectId(businessUnitId);
        } else {
          // Try to look up by custom ID
          const BusinessUnit = mongoose.model("BusinessUnit");
          const bu = await BusinessUnit.findOne({
            $or: [{ id: businessUnitId }, { slug: businessUnitId }]
          });
          if (bu) {
            objectId = bu._id;
          }
        }
      }
    }
  }

  const data = await getCategoriesService(objectId);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: " Category has been retrieved Successfully",
    data,
  });
});
