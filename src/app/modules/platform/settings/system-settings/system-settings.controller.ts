import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { SystemSettingsService } from "./system-settings.service.js";

const getSystemSettings = catchAsync(async (_req: Request, res: Response) => {
    const result = await SystemSettingsService.getSystemSettings();

    ApiResponse.success(
        res,
        result,
        "System settings retrieved successfully",
        httpStatus.OK
    );
});

const updateSystemSettings = catchAsync(async (req: Request, res: Response) => {
    const result = await SystemSettingsService.updateSystemSettings(req.body);

    ApiResponse.success(
        res,
        result,
        "System settings updated successfully",
        httpStatus.OK
    );
});

export const SystemSettingsController = {
    getSystemSettings,
    updateSystemSettings
};
