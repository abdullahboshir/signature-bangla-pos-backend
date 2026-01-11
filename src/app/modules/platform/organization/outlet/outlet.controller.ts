import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { OutletService } from "./outlet.service.ts";

const createOutlet = catchAsync(async (req: Request, res: Response) => {
    const result = await OutletService.createOutlet(req.body, (req as any).user);

    ApiResponse.success(res, result, "Outlet created successfully", httpStatus.CREATED);
});

const getAllOutlets = catchAsync(async (req: Request, res: Response) => {
    // Assuming we filter by Business Unit. 
    // Usually businessUnitId comes from generic middleware or query params
    const businessUnitId = (req.query['businessUnit'] as string) || (req.query['businessUnitId'] as string) || req.body?.businessUnit;

    // For now simplistic approach
    const result = await OutletService.getAllOutlets(businessUnitId, (req as any).user);

    ApiResponse.success(res, result, "Outlets retrieved successfully", httpStatus.OK);
});

const getOutletById = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'];
    if (!outletId) {
        throw new Error("Outlet ID is required");
    }
    const result = await OutletService.getOutletById(outletId);

    ApiResponse.success(res, result, "Outlet retrieved successfully", httpStatus.OK);
});

const updateOutlet = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'];
    if (!outletId) {
        throw new Error("Outlet ID is required");
    }
    const result = await OutletService.updateOutlet(outletId, req.body);

    ApiResponse.success(res, result, "Outlet updated successfully", httpStatus.OK);
});

const deleteOutlet = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'];
    if (!outletId) {
        throw new Error("Outlet ID is required");
    }
    const result = await OutletService.deleteOutlet(outletId);

    ApiResponse.success(res, result, "Outlet deleted successfully", httpStatus.OK);
});

const getOutletStats = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'];
    if (!outletId) {
        throw new Error("Outlet ID is required");
    }
    const result = await OutletService.getOutletStats(outletId, (req as any).user);

    ApiResponse.success(res, result, "Outlet stats retrieved successfully", httpStatus.OK);
});

export const OutletController = {
    createOutlet,
    getAllOutlets,
    getOutletById,
    updateOutlet,
    deleteOutlet,
    getOutletStats
};
