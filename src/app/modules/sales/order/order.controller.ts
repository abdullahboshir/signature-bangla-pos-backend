import type { NextFunction, Request, Response } from "express";
import { createOrderService, getAllOrdersService, getOrderByIdService, updateOrderStatusService } from "./order.service.js";
import catchAsync from "../../../../core/utils/catchAsync.js";
import { ApiResponse } from "../../../../core/utils/api-response.js";

export const createOrderController = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    // Assuming user/businessUnit is attached to req via middleware
    // For now, trust the body or inject businessUnit from user
    // req.body.businessUnit = req.user.businessUnit; 

    const result = await createOrderService(req.body);
    ApiResponse.success(res, result, "Order created successfully", 201);
});

export const getAllOrdersController = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const result = await getAllOrdersService(req.query);

    if (result && result.meta) {
        ApiResponse.paginated(
            res,
            result.result,
            result.meta.page,
            result.meta.limit,
            result.meta.total,
            "Orders retrieved successfully"
        );
    } else {
        ApiResponse.success(res, result, "Orders retrieved successfully");
    }
});

export const getOrderByIdController = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const orderId = req.params['id'];
    if (!orderId) {
        throw new Error("Order ID is required");
    }
    const result = await getOrderByIdService(orderId);
    ApiResponse.success(res, result, "Order details retrieved successfully");
});

export const updateOrderStatusController = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const orderId = req.params['id'];
    if (!orderId) {
        throw new Error("Order ID is required");
    }
    const result = await updateOrderStatusService(orderId, req.body.status);
    ApiResponse.success(res, result, "Order status updated successfully");
});
