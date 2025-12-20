import catchAsync from "../../../../core/utils/catchAsync.js";
import { ApiResponse } from "../../../../core/utils/api-response.js";
import status from "http-status";
import type { Request, Response } from "express";
import { getSettingsService, updateSettingsService } from "./business-unit-settings.service.js";

const getSettings = catchAsync(async (req: Request, res: Response) => {
    const { businessUnitId } = req.params;
    const result = await getSettingsService(businessUnitId as string);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: "Settings retrieved successfully",
        data: result,
    });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const { businessUnitId } = req.params;
    const result = await updateSettingsService(businessUnitId as string, req.body);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: "Settings updated successfully",
        data: result,
    });
});

export const BusinessUnitSettingsController = {
    getSettings,
    updateSettings,
};
