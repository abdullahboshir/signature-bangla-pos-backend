import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { SalesReportService } from "./sales-report.service.js";

const getSalesStats = catchAsync(async (req: Request, res: Response) => {
    // Extract filters from query
    const filters = {
        startDate: req.query['startDate'] as string,
        endDate: req.query['endDate'] as string,
        businessUnit: req.query['businessUnit'] as string,
        outlet: req.query['outlet'] as string,
    };

    const result = await SalesReportService.getSalesStats(filters);
    ApiResponse.success(res, result, "Sales report generated successfully", httpStatus.OK);
});

export const SalesReportController = {
    getSalesStats
};
