import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createEmailTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Email Template created successfully", httpStatus.CREATED);
});

const getAllEmailTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Email Templates retrieved successfully");
});

const getEmailTemplateById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Email Template retrieved successfully");
});

const updateEmailTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Email Template updated successfully");
});

const deleteEmailTemplate = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Email Template deleted successfully");
});

export const EmailTemplateController = {
    createEmailTemplate,
    getAllEmailTemplate,
    getEmailTemplateById,
    updateEmailTemplate,
    deleteEmailTemplate,
};
