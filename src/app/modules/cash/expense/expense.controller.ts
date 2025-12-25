import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { ExpenseService } from "./expense.service.js";

const createExpense = catchAsync(async (req: Request, res: Response) => {
    // Inject createdBy from auth user
    const user = req.user as any;
    req.body.createdBy = user._id;

    const result = await ExpenseService.createExpense(req.body);
    ApiResponse.success(res, result, "Expense created successfully", httpStatus.CREATED);
});

const getAllExpenses = catchAsync(async (req: Request, res: Response) => {
    const result = await ExpenseService.getAllExpenses(req.query);
    const { meta, result: data } = result;
    ApiResponse.paginated(res, data, meta.page, meta.limit, meta.total, "Expenses retrieved successfully");
});

const getExpenseById = catchAsync(async (req: Request, res: Response) => {
    const result = await ExpenseService.getExpenseById(req.params['id'] as string);
    ApiResponse.success(res, result, "Expense retrieved successfully", httpStatus.OK);
});

const updateExpense = catchAsync(async (req: Request, res: Response) => {
    const result = await ExpenseService.updateExpense(req.params['id'] as string, req.body);
    ApiResponse.success(res, result, "Expense updated successfully", httpStatus.OK);
});

const deleteExpense = catchAsync(async (req: Request, res: Response) => {
    const result = await ExpenseService.deleteExpense(req.params['id'] as string);
    ApiResponse.success(res, result, "Expense deleted successfully", httpStatus.OK);
});

export const ExpenseController = {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
};
