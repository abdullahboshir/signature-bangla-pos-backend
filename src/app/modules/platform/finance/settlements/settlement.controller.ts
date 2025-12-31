import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createSettlement = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Settlement created successfully", httpStatus.CREATED);
});

const getAllSettlement = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Settlements retrieved successfully");
});

const getSettlementById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Settlement retrieved successfully");
});

const updateSettlement = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Settlement updated successfully");
});

const deleteSettlement = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Settlement deleted successfully");
});

export const SettlementController = {
    createSettlement,
    getAllSettlement,
    getSettlementById,
    updateSettlement,
    deleteSettlement,
};
