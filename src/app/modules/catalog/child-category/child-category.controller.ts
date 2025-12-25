import status from 'http-status'
import {
  createChildCategoryService,
  getChildCategoriesService,
  getAllChildCategoriesService,
  getChildCategoryByIdService,
  updateChildCategoryService,
  deleteChildCategoryService,
  createChildCategoryWithResolution
} from './child-category.service.js'
import mongoose from 'mongoose'
import { ApiResponse } from '@core/utils/api-response.ts'
import catchAsync from '@core/utils/catchAsync.ts'
import { GenericController } from "@core/controllers/GenericController.ts";

// Use service with resolution (no duplicate logic needed)
export const createChildCategoryController = catchAsync(async (req, res) => {
  const data = await createChildCategoryWithResolution(req.body);
  ApiResponse.success(res, data, 'Child Category has been Created Successfully', status.OK);
})

export const getChildCategoriesController = catchAsync(async (req, res) => {
  const { subCategoryId } = req.params;

  if (!subCategoryId) {
    throw new Error("SubCategory ID is required");
  }
  const objectId = new mongoose.Types.ObjectId(subCategoryId);
  const data = await getChildCategoriesService(objectId);

  ApiResponse.success(res, data, 'Child Category has been retrieved Successfully', status.OK);
})

export const getAllChildCategoriesController = catchAsync(async (req, res) => {
  const result = await getAllChildCategoriesService(req.query);

  if (result && result.meta) {
    ApiResponse.paginated(
      res,
      result.result,
      result.meta.page,
      result.meta.limit,
      result.meta.total,
      "All Child Categories retrieved Successfully",
      status.OK
    );
  } else {
    ApiResponse.success(res, result, "All Child Categories retrieved Successfully", status.OK);
  }
});

const childCategoryServiceMap = {
  create: createChildCategoryWithResolution,
  getAll: getAllChildCategoriesService,
  getById: getChildCategoryByIdService,
  update: updateChildCategoryService,
  delete: deleteChildCategoryService,
};

export const ChildCategoryController = new GenericController(childCategoryServiceMap, "ChildCategory");
