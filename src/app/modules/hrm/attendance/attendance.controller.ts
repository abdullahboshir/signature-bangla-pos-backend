import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createAttendance = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Attendance created successfully", httpStatus.CREATED);
});

const getAllAttendance = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Attendance retrieved successfully");
});

const getAttendanceById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Attendance retrieved successfully");
});

const updateAttendance = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Attendance updated successfully");
});

const deleteAttendance = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Attendance deleted successfully");
});

export const AttendanceController = {
    createAttendance,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};
