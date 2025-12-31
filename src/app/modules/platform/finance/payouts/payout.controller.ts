import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createPayout = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payout created successfully", httpStatus.CREATED);
});

const getAllPayout = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Payouts retrieved successfully");
});

const getPayoutById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payout retrieved successfully");
});

const updatePayout = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payout updated successfully");
});

const deletePayout = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payout deleted successfully");
});

export const PayoutController = {
    createPayout,
    getAllPayout,
    getPayoutById,
    updatePayout,
    deletePayout,
};
