import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createBudget = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Budget created successfully", httpStatus.CREATED);
});

const getAllBudget = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Budgets retrieved successfully");
});

const getBudgetById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Budget retrieved successfully");
});

const updateBudget = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Budget updated successfully");
});

const deleteBudget = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Budget deleted successfully");
});

export const BudgetController = {
    createBudget,
    getAllBudget,
    getBudgetById,
    updateBudget,
    deleteBudget,
};
