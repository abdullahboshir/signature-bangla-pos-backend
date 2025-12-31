import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createDepartment = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Department created successfully", httpStatus.CREATED);
});

const getAllDepartment = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Departments retrieved successfully");
});

const getDepartmentById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Department retrieved successfully");
});

const updateDepartment = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Department updated successfully");
});

const deleteDepartment = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Department deleted successfully");
});

export const DepartmentController = {
    createDepartment,
    getAllDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
