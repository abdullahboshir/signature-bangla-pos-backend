import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response } from "express";
import { getAllStockLevelsService, getProductStockLevelService } from "./stock.service.ts";

export const getAllStockLevelsController = catchAsync(async (req: Request, res: Response) => {
    const result = await getAllStockLevelsService(req.query);
    ApiResponse.success(res, result, "Stock levels retrieved successfully");
});

export const getProductStockLevelController = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await getProductStockLevelService(id as string);
    ApiResponse.success(res, result, "Product stock level retrieved successfully");
});
