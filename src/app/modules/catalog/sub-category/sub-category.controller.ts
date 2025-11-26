import status from "http-status";

import {
  createSubCategoryService,
  getSubCategoriesService,
} from "./sub-category.service.js";

export const createSubCategoryController = catchAsync(async (req, res) => {
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
