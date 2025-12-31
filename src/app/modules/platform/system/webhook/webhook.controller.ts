import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createWebhook = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Webhook created successfully", httpStatus.CREATED);
});

const getAllWebhook = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Webhooks retrieved successfully");
});

const getWebhookById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Webhook retrieved successfully");
});

const updateWebhook = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Webhook updated successfully");
});

const deleteWebhook = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Webhook deleted successfully");
});

export const WebhookController = {
    createWebhook,
    getAllWebhook,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
};
