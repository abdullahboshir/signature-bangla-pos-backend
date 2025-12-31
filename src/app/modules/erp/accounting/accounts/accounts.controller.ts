import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createAccount = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Account created successfully", httpStatus.CREATED);
});

const getAllAccount = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Accounts retrieved successfully");
});

const getAccountById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Account retrieved successfully");
});

const updateAccount = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Account updated successfully");
});

const deleteAccount = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Account deleted successfully");
});

export const AccountController = {
    createAccount,
    getAllAccount,
    getAccountById,
    updateAccount,
    deleteAccount,
};
