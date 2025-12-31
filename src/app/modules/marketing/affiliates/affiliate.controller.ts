import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createAffiliate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Affiliate created successfully", httpStatus.CREATED);
});

const getAllAffiliate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Affiliates retrieved successfully");
});

const getAffiliateById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Affiliate retrieved successfully");
});

const updateAffiliate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Affiliate updated successfully");
});

const deleteAffiliate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Affiliate deleted successfully");
});

export const AffiliateController = {
    createAffiliate,
    getAllAffiliate,
    getAffiliateById,
    updateAffiliate,
    deleteAffiliate,
};
