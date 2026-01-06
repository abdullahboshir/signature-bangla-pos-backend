import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import { AttendanceService } from "./attendance.service.ts";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
    // Check In
    const userId = req.user?.['id'] || req.user?.['_id'];
    // Business Unit from header or params? Usually params in this architecture [business-unit]
    // But backend might depend on context.
    // For now assuming body carries data or we infer from context.
    const result = await AttendanceService.checkIn(userId, req.body);
    ApiResponse.success(res, result, "Checked in successfully", httpStatus.CREATED);
});

const getAllAttendance = catchAsync(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await AttendanceService.getAllAttendance(filters);
    ApiResponse.success(res, result, "Attendance retrieved successfully");
});

const getAttendanceById = catchAsync(async (req: Request, res: Response) => {
    const result = await AttendanceService.getAttendanceById(req.params['id']);
    ApiResponse.success(res, result, "Attendance retrieved successfully");
});

const updateAttendance = catchAsync(async (req: Request, res: Response) => {
    // Check Out or Update
    const result = await AttendanceService.updateAttendance(req.params['id'], req.body);
    ApiResponse.success(res, result, "Attendance updated successfully");
});

const deleteAttendance = catchAsync(async (req: Request, res: Response) => {
    await AttendanceService.deleteAttendance(req.params['id']);
    ApiResponse.success(res, null, "Attendance deleted successfully");
});

export const AttendanceController = {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};
