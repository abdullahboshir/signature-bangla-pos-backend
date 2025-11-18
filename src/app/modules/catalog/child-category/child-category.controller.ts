
import status from 'http-status'
import catchAsync from '../../utils/catchAsync.js'
import { createChildCategoryService, getChildCategoriesService } from './child-category.service.js'
import sendResponse from '../../utils/sendResponse.js'
import mongoose from 'mongoose'


export const createChildCategoryController = catchAsync(async (req, res) => {
  const data = await createChildCategoryService(req.body)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: 'Sub Category has been Created Successfully',
    data,
  })
})


export const getChildCategoriesController = catchAsync(async (req, res) => {
    const { subCategoryId } = req.params;

  if (!subCategoryId) {
    return sendResponse(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Child-Category ID is required",
      data: null,
    });
  }
  console.log(subCategoryId);
  const objectId = new mongoose.Types.ObjectId(subCategoryId);
  const data = await getChildCategoriesService(objectId)


  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: ' Child Category has been retrieved Successfully',
    data,
  })
})
