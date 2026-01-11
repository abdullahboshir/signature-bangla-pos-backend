import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import type { Request, Response, NextFunction } from "express";

const createAuditLog = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log created successfully");
});

import { AuditLog } from "./audit-log.model.js";

const getAllAuditLog = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const query = req.query as any;

    // 1. Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Filter Construction
    const filter: Record<string, any> = {};

    // Filter by Module (e.g., ?module=pos)
    if (query.module) {
        filter['module'] = query.module;
    }

    // Filter by Action (e.g., ?action=DELETE_ORDER)
    if (query.action) {
        filter['action'] = { $regex: query.action as string, $options: 'i' };
    }

    // Filter by Actor (e.g., ?userId=...)
    if (query.userId) {
        filter['actor.userId'] = query.userId;
    }

    // Filter by Date Range
    if (query.startDate && query.endDate) {
        filter['timestamp'] = {
            $gte: new Date(query.startDate as string),
            $lte: new Date(query.endDate as string)
        };
    }

    // Scoped Access Control
    // If user is NOT Super Admin, restrict what logs they can see
    const user = (req as any).user;
    if (user && !user.isSuperAdmin) {
        // Business Admin can only see logs for their Business Unit or Company
        // We check the context from the header or user's active context
        const businessUnitId = req.headers['x-business-unit-id'] || user.primaryBusinessUnit;

        if (businessUnitId) {
            filter['businessUnit'] = businessUnitId;
        } else {
            // Safety fallback: if no context, show nothing or only own logs
            filter['actor.userId'] = user.userId;
        }
    }
    // Super Admin sees everything by default, but can filter by ?businessUnit=...
    if (query.businessUnit) {
        filter['businessUnit'] = query.businessUnit;
    }

    // 3. Query Execution
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('businessUnit', 'name') // Optional: to show BU name
        .lean();

    ApiResponse.paginated(res, logs, page, limit, total, "Audit Logs retrieved successfully");
});

const getAuditLogById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log retrieved successfully");
});

const deleteAuditLog = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Audit Log deleted successfully");
});

export const AuditLogController = {
    createAuditLog,
    getAllAuditLog,
    getAuditLogById,
    deleteAuditLog,
};
