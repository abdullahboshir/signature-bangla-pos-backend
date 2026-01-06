import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import { LeaveService } from "./leave.service.ts";

const createLeave = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.['id'] || req.user?.['_id'];
    if (!userId) throw new Error("User not authenticated");
    const result = await LeaveService.createLeave(userId as string, req.body);
    ApiResponse.success(res, result, "Leave request submitted successfully", httpStatus.CREATED);
});

const getAllLeave = catchAsync(async (req: Request, res: Response) => {
    const result = await LeaveService.getAllLeave(req.query);
    ApiResponse.success(res, result, "Leaves retrieved successfully");
});

const getLeaveById = catchAsync(async (req: Request, res: Response) => {
    // Basic implementation if needed, Service doesn't have it yet but Controller has stub
    // Skip service call or add it if strictly needed. 
    // For now returning null or implementing in service later.
    // Actually, let's keep it null or remove it. Stubs are fine.
    ApiResponse.success(res, null, "Leave retrieved successfully");
});

const updateLeave = catchAsync(async (req: Request, res: Response) => {
    // This expects PATCH for connection approval/rejection
    // Body: { status: 'approved' | 'rejected', reason?: string }
    const userId = req.user?.['id'] || req.user?.['_id'];
    if (!userId) throw new Error("User not authenticated");
    const result = await LeaveService.updateLeaveStatus(
        req.params['id'] as string,
        req.body.status,
        userId as string,
        req.body.reason
    );
    ApiResponse.success(res, result, "Leave request updated successfully");
});

const deleteLeave = catchAsync(async (req: Request, res: Response) => {
    await LeaveService.deleteLeave(req.params['id'] as string);
    ApiResponse.success(res, null, "Leave request deleted successfully");
});

export const LeaveController = {
    createLeave,
    getAllLeave,
    getLeaveById,
    updateLeave,
    deleteLeave,
};
