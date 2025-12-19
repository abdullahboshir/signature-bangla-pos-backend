import catchAsync from "@shared/utils/catch-async.js";
import sendResponse from "@shared/utils/send-response.js";
import { Request, Response } from "express";
import { getSettingsService, updateSettingsService } from "./business-unit-settings.service.js";

const getSettings = catchAsync(async (req: Request, res: Response) => {
    // Assuming businessUnitId is passed in params or extracted from user context
    // Here we use the business unit from the route param :businessUnitId
    // or if the authenticated user belongs to one. 
    // Let's assume the route is /:businessUnitId/settings

    const { businessUnitId } = req.params;
    const result = await getSettingsService(businessUnitId);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Settings retrieved successfully",
        data: result,
    });
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const { businessUnitId } = req.params;
    const result = await updateSettingsService(businessUnitId, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Settings updated successfully",
        data: result,
    });
});

export const BusinessUnitSettingsController = {
    getSettings,
    updateSettings,
};
