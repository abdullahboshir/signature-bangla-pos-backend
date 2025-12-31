import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createLanguage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Language created successfully", httpStatus.CREATED);
});

const getAllLanguage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Languages retrieved successfully");
});

const getLanguageById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Language retrieved successfully");
});

const updateLanguage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Language updated successfully");
});

const deleteLanguage = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Language deleted successfully");
});

export const LanguageController = {
    createLanguage,
    getAllLanguage,
    getLanguageById,
    updateLanguage,
    deleteLanguage,
};
