import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response } from "express";

const getAllNotification = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Notifications retrieved successfully");
});

const markAsRead = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Notification marked as read");
});

const deleteNotification = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Notification deleted successfully");
});

export const NotificationController = {
    getAllNotification,
    markAsRead,
    deleteNotification,
};
