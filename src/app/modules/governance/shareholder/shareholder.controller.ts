import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import { ShareholderService } from "./shareholder.service.ts";

const createShareholder = catchAsync(async (req: Request, res: Response) => {
    // Usually payload contains user (id), businessUnit (id/slug), equityPercentage
    const result = await ShareholderService.createShareholder(req.body);
    ApiResponse.success(res, result, "Shareholder added successfully", httpStatus.CREATED);
});

const getAllShareholders = catchAsync(async (req: Request, res: Response) => {
    const result = await ShareholderService.getAllShareholders(req.query);
    ApiResponse.success(res, result, "Shareholders retrieved successfully");
});

const updateShareholder = catchAsync(async (req: Request, res: Response) => {
    const result = await ShareholderService.updateShareholder(req.params['id'] as string, req.body);
    ApiResponse.success(res, result, "Shareholder updated successfully");
});

const deleteShareholder = catchAsync(async (req: Request, res: Response) => {
    await ShareholderService.deleteShareholder(req.params['id'] as string);
    ApiResponse.success(res, null, "Shareholder removed successfully");
});

export const ShareholderController = {
    createShareholder,
    getAllShareholders,
    updateShareholder,
    deleteShareholder,
};
