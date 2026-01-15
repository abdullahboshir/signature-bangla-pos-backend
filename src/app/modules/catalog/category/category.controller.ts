import { GenericController } from "@core/controllers/GenericController.ts";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import {
  createCategoryService,
  getCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService
} from "./category.service.ts";

const categoryServiceMap = {
  create: createCategoryService,
  getAll: getCategoriesService,
  getById: getCategoryByIdService,
  update: updateCategoryService,
  delete: deleteCategoryService
};

export const CategoryController = new GenericController(categoryServiceMap, "Category");

export const getCategoriesByBusinessUnit = catchAsync(async (req: Request, res: Response) => {
  const { businessUnitId } = req.params;
  const result = await getCategoriesService({ businessUnitId });
  ApiResponse.success(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully",
    data: result,
  });
});
