import type { Request, Response } from "express";

import httpStatus from "http-status";
import { CashRegisterService } from "./cash-register.service.js";
import { ApiResponse } from "@core/utils/api-response.ts";
import catchAsync from "@core/utils/catchAsync.ts";

const openRegister = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as any;
    const result = await CashRegisterService.openRegister(req.body, user._id);
    ApiResponse.success(res, result, "Register opened successfully", httpStatus.CREATED);
});

const closeRegister = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as any;
    const result = await CashRegisterService.closeRegister(req.params['id'] as string, req.body, user._id);
    ApiResponse.success(res, result, "Register closed successfully", httpStatus.OK);
});

const getMyActiveRegister = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { outletId } = req.query;
    const result = await CashRegisterService.getMyActiveRegister(user._id, outletId as string);
    ApiResponse.success(res, result, "Active register status retrieved", httpStatus.OK);
});

const getAllRegisters = catchAsync(async (req: Request, res: Response) => {
    const result = await CashRegisterService.getAllRegisters(req.query);
    const { meta, result: data } = result;
    ApiResponse.paginated(res, data, meta.page, meta.limit, meta.total, "Registers retrieved successfully");
});

const getRegisterById = catchAsync(async (req: Request, res: Response) => {
    const result = await CashRegisterService.getRegisterById(req.params['id'] as string);
    ApiResponse.success(res, result, "Register retrieved successfully", httpStatus.OK);
});

export const CashRegisterController = {
    openRegister,
    closeRegister,
    getMyActiveRegister,
    getAllRegisters,
    getRegisterById,
};
