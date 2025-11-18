import status from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import {
  createSubCategoryService,
  getSubCategoriesService,
} from "./sub-category.service.js";

export const createSubCategoryController = catchAsync(async (req, res) => {
  const data = await createSubCategoryService(req.body);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Sub Category has been Created Successfully",
    data,
  });
});

import mongoose from "mongoose";

export const getSubCategoriesController = catchAsync(async (req, res) => {
  const { categoryId } = req.params;

  if (!categoryId) {
    return sendResponse(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Category ID is required",
      data: null,
    });
  }
  const objectId = new mongoose.Types.ObjectId(categoryId);
  const data = await getSubCategoriesService(objectId);

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: " Sub Category has been retrieved Successfully",
    data,
  });
});
