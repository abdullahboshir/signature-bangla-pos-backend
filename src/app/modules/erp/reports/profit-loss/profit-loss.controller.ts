import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { ProfitLossService } from "./profit-loss.service.js";

const getProfitLoss = catchAsync(async (req: Request, res: Response) => {
    // Required filters
    const filters = {
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string,
        businessUnit: req.query['businessUnit'] as string,
        outlet: req.query['outlet'] as string,
    };

    if (!filters.startDate || !filters.endDate) {
        // We can throw error or set defaults 'this month'
        // Let's set default directly in service or here.
        // For strictness, let's require them.
        throw new Error("Start Date and End Date are required for P&L Statement");
    }

    const result = await ProfitLossService.getProfitLossStatement(filters);
    ApiResponse.success(res, result, "Profit & Loss statement generated successfully", httpStatus.OK);
});

export const ProfitLossController = {
    getProfitLoss
};
