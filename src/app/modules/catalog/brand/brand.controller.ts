import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { BrandService } from "./brand.service.ts";

import BusinessUnit from "@app/modules/organization/business-unit/business-unit.model.ts";
import mongoose from "mongoose";

const createBrand = catchAsync(async (req, res) => {
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

    const result = await BrandService.createBrand(req.body);
    ApiResponse.success(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Brand created successfully",
        data: result,
    });
});

const getAllBrands = catchAsync(async (req, res) => {
    const result = await BrandService.getAllBrands();
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Brands retrieved successfully",
        data: result,
    });
});

const getBrandById = catchAsync(async (req, res) => {
    const result = await BrandService.getBrandById(req.params.id);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Brand retrieved successfully",
        data: result,
    });
});

const updateBrand = catchAsync(async (req, res) => {
    const result = await BrandService.updateBrand(req.params.id, req.body);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Brand updated successfully",
        data: result,
    });
});

const deleteBrand = catchAsync(async (req, res) => {
    const result = await BrandService.deleteBrand(req.params.id);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Brand deleted successfully",
        data: result,
    });
});

export const BrandController = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
};
