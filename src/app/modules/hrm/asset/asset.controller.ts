import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createAsset = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Asset created successfully", httpStatus.CREATED);
});

const getAllAsset = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Assets retrieved successfully");
});

const getAssetById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Asset retrieved successfully");
});

const updateAsset = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Asset updated successfully");
});

const deleteAsset = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Asset deleted successfully");
});

export const AssetController = {
    createAsset,
    getAllAsset,
    getAssetById,
    updateAsset,
    deleteAsset,
};
