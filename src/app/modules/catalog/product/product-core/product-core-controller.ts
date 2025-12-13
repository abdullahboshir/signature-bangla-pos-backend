import status from "http-status";
import mongoose from "mongoose";
import BusinessUnit from "@app/modules/organization/business-unit/business-unit.model.ts";
import { createProductService, getAllProductsService, getProductByIdService, updateProductService, deleteProductService } from "./product-core.service.js";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";



export const createProductController = catchAsync(async (req, res) => {
  // Resolve Business Unit ID if it's a custom string ID in the body
  let { businessUnit } = req.body;

  if (businessUnit && typeof businessUnit === 'string') {
    const isObjectId = mongoose.Types.ObjectId.isValid(businessUnit) && /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isObjectId) {
      // const BusinessUnit = mongoose.models.BusinessUnit || mongoose.model("BusinessUnit"); // Removed dynamic
      const bu = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });

      if (bu) {
        req.body.businessUnit = bu._id;
      } else {
        // If invalid BU, let it fail validation or throw error
        throw new Error(`Business Unit not found: ${businessUnit}`);
      }
    }
  }

  const data = await createProductService(req?.body)

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product has been Created Successfully',
    data,
  })
})


export const getAllProductsController = catchAsync(async (req: any, res) => {
  const filters = { ...req.query };

  // Resolve Business Unit ID if it's a custom string ID
  let { businessUnit } = filters;

  if (businessUnit && typeof businessUnit === 'string') {
    const isObjectId = mongoose.Types.ObjectId.isValid(businessUnit) && /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isObjectId) {

      const bu = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });

      if (bu) {
        filters.businessUnit = bu._id;
      } else {
        // If valid BU not found, maybe return empty or let it fail? 
        // For now, let's keep it, but it might still fail casting if we don't null it. 
        // Ideally we should return empty list if BU context is invalid.
        // But let's assume if it fails lookup, we filter by a non-existent ID to return empty array safely
        filters.businessUnit = new mongoose.Types.ObjectId(0); // Dummy safe ID
      }
    }
  }

  const data = await getAllProductsService(filters);

  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Products retrieved successfully',
    data,
  });
});

export const getProductByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = await getProductByIdService(id as string);
  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product retrieved successfully',
    data,
  });
});

export const updateProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  let { businessUnit } = req.body;

  if (businessUnit && typeof businessUnit === 'string') {
    const isObjectId = mongoose.Types.ObjectId.isValid(businessUnit) && /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isObjectId) {
      const bu = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });

      if (bu) {
        req.body.businessUnit = bu._id;
      } else {
        throw new Error(`Business Unit not found: ${businessUnit}`);
      }
    }
  }

  const data = await updateProductService(id as string, req.body);
  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product updated successfully',
    data,
  });
});

export const deleteProductController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const data = await deleteProductService(id as string);
  ApiResponse.success(res, {
    success: true,
    statusCode: status.OK,
    message: 'Product deleted successfully',
    data,
  });
});