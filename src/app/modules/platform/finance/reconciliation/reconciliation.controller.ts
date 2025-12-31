import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createReconciliation = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Reconciliation created successfully", httpStatus.CREATED);
});

const getAllReconciliation = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Reconciliations retrieved successfully");
});

const getReconciliationById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Reconciliation retrieved successfully");
});

const updateReconciliation = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Reconciliation updated successfully");
});

const deleteReconciliation = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Reconciliation deleted successfully");
});

export const ReconciliationController = {
    createReconciliation,
    getAllReconciliation,
    getReconciliationById,
    updateReconciliation,
    deleteReconciliation,
};
