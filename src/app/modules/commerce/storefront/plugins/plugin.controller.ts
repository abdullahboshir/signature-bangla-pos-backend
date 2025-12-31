import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createPlugin = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Plugin created successfully", httpStatus.CREATED);
});

const getAllPlugin = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Plugins retrieved successfully");
});

const getPluginById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Plugin retrieved successfully");
});

const updatePlugin = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Plugin updated successfully");
});

const deletePlugin = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Plugin deleted successfully");
});

export const PluginController = {
    createPlugin,
    getAllPlugin,
    getPluginById,
    updatePlugin,
    deletePlugin,
};
