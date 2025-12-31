import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createSEO = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SEO created successfully", httpStatus.CREATED);
});

const getAllSEO = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "SEO data retrieved successfully");
});

const getSEOById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SEO retrieved successfully");
});

const updateSEO = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SEO updated successfully");
});

const deleteSEO = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SEO deleted successfully");
});

export const SEOController = {
    createSEO,
    getAllSEO,
    getSEOById,
    updateSEO,
    deleteSEO,
};
