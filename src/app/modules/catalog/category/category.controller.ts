import status from "http-status";

import {
  createCategoryService,
  getCategoriesService,
} from "./category.service.js";
import mongoose from "mongoose";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

export const createCategoryController = catchAsync(async (req, res) => {
  const data = await createCategoryService(req.body);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: " Category has been Created Successfully",
    data,
  });
});

export const getCategoriesController = catchAsync(async (req, res) => {
  const { departmentId } = req.params;

  const objectId =
    departmentId === "null" ? null : new mongoose.Types.ObjectId(departmentId);
  const data = await getCategoriesService(objectId);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: " Category has been retrieved Successfully",
    data,
  });
});
