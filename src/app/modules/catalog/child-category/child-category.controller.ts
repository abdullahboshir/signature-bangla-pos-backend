
import status from 'http-status'
import { createChildCategoryService, getChildCategoriesService, getAllChildCategoriesService } from './child-category.service.js'
import mongoose from 'mongoose'
import { ApiResponse } from '@core/utils/api-response.ts'
import catchAsync from '@core/utils/catchAsync.ts'


export const createChildCategoryController = catchAsync(async (req, res) => {
  let { subCategory, businessUnit } = req.body;

  // Resolve SubCategory
  if (subCategory) {
    const isSubObjectId = mongoose.Types.ObjectId.isValid(subCategory) || /^[0-9a-fA-F]{24}$/.test(subCategory);
    if (!isSubObjectId) {
      const SubCategory = mongoose.model("SubCategory");
      const subDoc = await SubCategory.findOne({
        $or: [{ id: subCategory }, { slug: subCategory }]
      });
      if (!subDoc) {
        return ApiResponse.success(res, {
          success: false,
          statusCode: status.NOT_FOUND,
          message: `SubCategory Not Found: '${subCategory}'`,
          data: null,
        });
      }
      req.body.subCategory = subDoc._id;
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

  const data = await createChildCategoryService(req.body);

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

export const getAllChildCategoriesController = catchAsync(async (req, res) => {
  const data = await getAllChildCategoriesService();

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: "All Child Categories retrieved Successfully",
    data,
  });
});
