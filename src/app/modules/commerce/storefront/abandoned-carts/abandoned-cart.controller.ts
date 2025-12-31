import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createAbandonedCart = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Abandoned Cart created successfully", httpStatus.CREATED);
});

const getAllAbandonedCart = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Abandoned Carts retrieved successfully");
});

const getAbandonedCartById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Abandoned Cart retrieved successfully");
});

const updateAbandonedCart = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Abandoned Cart updated successfully");
});

const deleteAbandonedCart = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Abandoned Cart deleted successfully");
});

export const AbandonedCartController = {
    createAbandonedCart,
    getAllAbandonedCart,
    getAbandonedCartById,
    updateAbandonedCart,
    deleteAbandonedCart,
};
