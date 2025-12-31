import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response } from "express";

export const getAllSuppliersController = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, [], "Suppliers retrieved successfully");
});
