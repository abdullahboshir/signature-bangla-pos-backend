import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createPayroll = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payroll created successfully", httpStatus.CREATED);
});

const getAllPayroll = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Payrolls retrieved successfully");
});

const getPayrollById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payroll retrieved successfully");
});

const updatePayroll = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payroll updated successfully");
});

const deletePayroll = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Payroll deleted successfully");
});

export const PayrollController = {
    createPayroll,
    getAllPayroll,
    getPayrollById,
    updatePayroll,
    deletePayroll,
};
