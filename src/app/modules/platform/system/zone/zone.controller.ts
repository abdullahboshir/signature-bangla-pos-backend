import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createZone = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Zone created successfully", httpStatus.CREATED);
});

const getAllZone = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Zones retrieved successfully");
});

const getZoneById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Zone retrieved successfully");
});

const updateZone = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Zone updated successfully");
});

const deleteZone = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Zone deleted successfully");
});

export const ZoneController = {
    createZone,
    getAllZone,
    getZoneById,
    updateZone,
    deleteZone,
};
