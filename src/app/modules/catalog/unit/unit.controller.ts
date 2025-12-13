import catchAsync from "@core/utils/catchAsync.ts";
import type { Request, Response } from "express";
import { UnitService } from "./unit.service.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";

import BusinessUnit from "@app/modules/organization/business-unit/business-unit.model.ts";
import mongoose from "mongoose";

const createUnit = catchAsync(async (req: Request, res: Response) => {
    // Resolve Business Unit ID if it's a custom string ID in the body
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

    // For now, hardcode businessUnit or extract from valid context if available
    // Assuming req.body has everything needed or middleware adds it
    console.log("Create Unit Request Body:", req.body);
    try {
        const result = await UnitService.createUnit({
            ...req.body,
            // TODO: In real app, createdBy comes from req.user
            createdBy: "654c8f1e5d7a4b0012345678", // Placeholder or from auth middleware
        });
        ApiResponse.success(res, {
            statusCode: httpStatus.CREATED,
            success: true,
            message: "Unit created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Create Unit Service Error:", error);
        throw error;
    }
});

const getAllUnits = catchAsync(async (req: Request, res: Response) => {
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

    const result = await UnitService.getAllUnits(req.query);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Units retrieved successfully",
        data: result,
    });
});

const getUnitById = catchAsync(async (req: Request, res: Response) => {
    const result = await UnitService.getUnitById(req.params['id'] as string);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Unit retrieved successfully",
        data: result,
    });
});

const updateUnit = catchAsync(async (req: Request, res: Response) => {
    const result = await UnitService.updateUnit(req.params['id'] as string, req.body);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Unit updated successfully",
        data: result,
    });
});

const deleteUnit = catchAsync(async (req: Request, res: Response) => {

    const result = await UnitService.deleteUnit(req.params['id'] as string);
    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Unit deleted successfully",
        data: result,
    });
});

export const UnitController = {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
};
