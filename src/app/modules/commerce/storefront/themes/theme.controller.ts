import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createTheme = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Theme created successfully", httpStatus.CREATED);
});

const getAllTheme = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Themes retrieved successfully");
});

const getThemeById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Theme retrieved successfully");
});

const updateTheme = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Theme updated successfully");
});

const deleteTheme = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Theme deleted successfully");
});

export const ThemeController = {
    createTheme,
    getAllTheme,
    getThemeById,
    updateTheme,
    deleteTheme,
};
