
import status from 'http-status'
import catchAsync from '../../utils/catchAsync.js'
import { createCategoryService, getCategoriesService } from './category.service.js'
import sendResponse from '../../utils/sendResponse.js'
import mongoose from 'mongoose'



export const createCategoryController = catchAsync(async (req, res) => {
  const data = await createCategoryService(req.body)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: ' Category has been Created Successfully',
    data,
  })
})


export const getCategoriesController = catchAsync(async (req, res) => {
      const { departmentId } = req.params;

  const objectId = departmentId === 'null' ? null : new mongoose.Types.ObjectId(departmentId);
  const data = await getCategoriesService(objectId)

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: ' Category has been retrieved Successfully',
    data,
  })
})
