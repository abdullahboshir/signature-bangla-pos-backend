import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createLandingPage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Landing Page created successfully", httpStatus.CREATED);
});

const getAllLandingPage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Landing Pages retrieved successfully");
});

const getLandingPageById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Landing Page retrieved successfully");
});

const updateLandingPage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Landing Page updated successfully");
});

const deleteLandingPage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Landing Page deleted successfully");
});

export const LandingPageController = {
    createLandingPage,
    getAllLandingPage,
    getLandingPageById,
    updateLandingPage,
    deleteLandingPage,
};
