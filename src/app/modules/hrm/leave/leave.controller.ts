import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createLeave = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Leave created successfully", httpStatus.CREATED);
});

const getAllLeave = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Leaves retrieved successfully");
});

const getLeaveById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Leave retrieved successfully");
});

const updateLeave = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Leave updated successfully");
});

const deleteLeave = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Leave deleted successfully");
});

export const LeaveController = {
    createLeave,
    getAllLeave,
    getLeaveById,
    updateLeave,
    deleteLeave,
};
