
import status from 'http-status'
import { createChildCategoryService, getChildCategoriesService } from './child-category.service.js'
import mongoose from 'mongoose'
import { ApiResponse } from '@core/utils/api-response.ts'
import catchAsync from '@core/utils/catchAsync.ts'


export const createChildCategoryController = catchAsync(async (req, res) => {
  const data = await createChildCategoryService(req.body)

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Sub Category has been Created Successfully',
    data,
  })
})


export const getChildCategoriesController = catchAsync(async (req, res) => {
    const { subCategoryId } = req.params;

  if (!subCategoryId) {
    return ApiResponse.success(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Child-Category ID is required",
      data: null,
    });
  }
  console.log(subCategoryId);
  const objectId = new mongoose.Types.ObjectId(subCategoryId);
  const data = await getChildCategoriesService(objectId)


  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: ' Child Category has been retrieved Successfully',
    data,
  })
})
