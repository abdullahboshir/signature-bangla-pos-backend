import catchAsync from "@core/utils/catchAsync.ts";
import type { Request, Response } from "express";
import { TaxService } from "./tax.service.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";

import BusinessUnit from "@app/modules/organization/business-unit/business-unit.model.ts";
import mongoose from "mongoose";

const createTax = catchAsync(async (req: Request, res: Response) => {
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

    // TODO: Get createdBy from req.user
    const result = await TaxService.createTax({
        ...req.body,
        // createdBy: req.user._id
    });
    ApiResponse.success(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tax created successfully",
        data: result,
    });
});

const getAllTaxes = catchAsync(async (req: Request, res: Response) => {
    let { businessUnitId } = req.query;

    if (businessUnitId && typeof businessUnitId === 'string') {
        const isObjectId = mongoose.Types.ObjectId.isValid(businessUnitId) && /^[0-9a-fA-F]{24}$/.test(businessUnitId);

        if (!isObjectId) {
            const bu = await BusinessUnit.findOne({
                $or: [{ id: businessUnitId }, { slug: businessUnitId }]
            });

            if (bu) {
                req.query.businessUnitId = bu._id as any;
            }
        }
    }

    const result = await TaxService.getAllTaxes(req.query);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Taxes retrieved successfully",
        data: result,
    });
});

const getTaxById = catchAsync(async (req: Request, res: Response) => {
    const result = await TaxService.getTaxById(req.params['id'] as string);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tax retrieved successfully",
        data: result,
    });
});

const updateTax = catchAsync(async (req: Request, res: Response) => {
    const result = await TaxService.updateTax(req.params['id'] as string, req.body);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tax updated successfully",
        data: result,
    });
});

const deleteTax = catchAsync(async (req: Request, res: Response) => {
    const result = await TaxService.deleteTax(req.params['id'] as string);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tax deleted successfully",
        data: result,
    });
});

export const TaxController = {
    createTax,
    getAllTaxes,
    getTaxById,
    updateTax,
    deleteTax,
};
