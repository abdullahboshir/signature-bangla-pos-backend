import status from "http-status";

import {
  createSubCategoryService,
  getSubCategoriesService,
  getAllSubCategoriesService,
  getSubCategoryByIdService,
  updateSubCategoryService,
  deleteSubCategoryService,
  createSubCategoryWithResolution
} from "./sub-category.service.js";

import mongoose from "mongoose";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import { GenericController } from "@core/controllers/GenericController.ts";

// Use service with resolution (no duplicate logic needed)
export const createSubCategoryController = catchAsync(async (req, res) => {
  const data = await createSubCategoryWithResolution(req.body);
  ApiResponse.success(res, data, "Sub Category has been Created Successfully", status.OK);
});

export const getSubCategoriesController = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    throw new Error("Category ID is required");
  }
  const objectId = new mongoose.Types.ObjectId(categoryId);
  const data = await getSubCategoriesService(objectId);

  ApiResponse.success(res, data, "Sub Category has been retrieved Successfully", status.OK);
});

export const getAllSubCategoriesController = catchAsync(async (req, res) => {
  const result = await getAllSubCategoriesService(req.query);

  if (result && result.meta) {
    ApiResponse.paginated(
      res,
      result.result,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
      "All Sub Categories retrieved Successfully",
      status.OK
    );
  } else {
    ApiResponse.success(res, result, "All Sub Categories retrieved Successfully", status.OK);
  }
});

const subCategoryServiceMap = {
  create: createSubCategoryWithResolution, // Use custom creator with resolution logic
  getAll: getAllSubCategoriesService,
  getById: getSubCategoryByIdService,
  update: updateSubCategoryService,
  delete: deleteSubCategoryService,
};

export const SubCategoryController = new GenericController(subCategoryServiceMap, "SubCategory");
