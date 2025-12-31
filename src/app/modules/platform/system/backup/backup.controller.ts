import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response } from "express";

const createBackup = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Backup created successfully");
});

const getAllBackup = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Backups retrieved successfully");
});

const getBackupById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Backup retrieved successfully");
});

const restoreBackup = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Backup restored successfully");
});

const deleteBackup = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Backup deleted successfully");
});

export const BackupController = {
    createBackup,
    getAllBackup,
    getBackupById,
    restoreBackup,
    deleteBackup,
};
