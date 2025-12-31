import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response } from "express";

const createAuditLog = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log created successfully");
});

const getAllAuditLog = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Audit Logs retrieved successfully");
});

const getAuditLogById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log retrieved successfully");
});

const deleteAuditLog = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log deleted successfully");
});

export const AuditLogController = {
    createAuditLog,
    getAllAuditLog,
    getAuditLogById,
    deleteAuditLog,
};
