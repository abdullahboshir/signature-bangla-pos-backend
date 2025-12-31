import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createPixel = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Pixel created successfully", httpStatus.CREATED);
});

const getAllPixel = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Pixels retrieved successfully");
});

const getPixelById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Pixel retrieved successfully");
});

const updatePixel = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Pixel updated successfully");
});

const deletePixel = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Pixel deleted successfully");
});

export const PixelController = {
    createPixel,
    getAllPixel,
    getPixelById,
    updatePixel,
    deletePixel,
};
