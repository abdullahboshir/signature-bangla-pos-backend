import status from "http-status";

import {
  createSubCategoryService,
  getSubCategoriesService,
  getAllSubCategoriesService,
} from "./sub-category.service.js";

export const createSubCategoryController = catchAsync(async (req, res) => {
  let { category, businessUnit } = req.body;

  // Resolve Category
  if (category) {
    const isCatObjectId = mongoose.Types.ObjectId.isValid(category) || /^[0-9a-fA-F]{24}$/.test(category);
    if (!isCatObjectId) {
      const Category = mongoose.model("Category");
      const catDoc = await Category.findOne({
        $or: [{ id: category }, { slug: category }]
      });
      if (!catDoc) {
        return ApiResponse.success(res, {
          success: false,
          statusCode: status.NOT_FOUND,
          message: `Category Not Found: '${category}'`,
          data: null,
        });
      }
      req.body.category = catDoc._id;
    }
  }

  // Resolve Business Unit
  if (businessUnit) {
    if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
    const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isBuObjectId) {
      const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
      const buDoc = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });
      if (!buDoc) {
        return ApiResponse.success(res, {
          success: false,
          statusCode: status.NOT_FOUND,
          message: `Business Unit Not Found: '${businessUnit}'`,
          data: null,
        });
      }
      req.body.businessUnit = buDoc._id;
    }
  }

  const data = await createSubCategoryService(req.body);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "Sub Category has been Created Successfully",
    data,
  });
});

import mongoose from "mongoose";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

export const getSubCategoriesController = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return ApiResponse.success(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Category ID is required",
      data: null,
    });
  }
  const objectId = new mongoose.Types.ObjectId(categoryId);
  const data = await getSubCategoriesService(objectId);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: " Sub Category has been retrieved Successfully",
    data,
  });
});

export const getAllSubCategoriesController = catchAsync(async (req, res) => {
  const data = await getAllSubCategoriesService();

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "All Sub Categories retrieved Successfully",
    data,
  });
});
