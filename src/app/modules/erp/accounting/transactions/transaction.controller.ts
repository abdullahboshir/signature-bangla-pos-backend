import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createTransaction = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Transaction created successfully", httpStatus.CREATED);
});

const getAllTransaction = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Transactions retrieved successfully");
});

const getTransactionById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Transaction retrieved successfully");
});

const updateTransaction = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Transaction updated successfully");
});

const deleteTransaction = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Transaction deleted successfully");
});

export const TransactionController = {
    createTransaction,
    getAllTransaction,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
};
