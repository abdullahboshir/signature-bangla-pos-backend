import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createSMSTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SMS Template created successfully", httpStatus.CREATED);
});

const getAllSMSTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "SMS Templates retrieved successfully");
});

const getSMSTemplateById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SMS Template retrieved successfully");
});

const updateSMSTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SMS Template updated successfully");
});

const deleteSMSTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "SMS Template deleted successfully");
});

export const SMSTemplateController = {
    createSMSTemplate,
    getAllSMSTemplate,
    getSMSTemplateById,
    updateSMSTemplate,
    deleteSMSTemplate,
};
