import type { Request, Response } from "express";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import { GenericController } from "@core/controllers/GenericController.ts";
import { RiskService } from "./risk.service.ts";

// Map for Blacklist Service
const blacklistServiceMap = {
    create: RiskService.createBlacklistEntry,
    getAll: RiskService.getAllBlacklistEntries,
    getById: RiskService.getBlacklistEntryById,
    update: RiskService.updateBlacklistEntry,
    delete: RiskService.deleteBlacklistEntry
};

// Map for RiskRule Service
const riskRuleServiceMap = {
    create: RiskService.createRiskRule,
    getAll: RiskService.getAllRiskRules,
    getById: RiskService.getRiskRuleById,
    update: RiskService.updateRiskRule,
    delete: RiskService.deleteRiskRule
};

const blacklistController = new GenericController(blacklistServiceMap, 'Blacklist');
const riskRuleController = new GenericController(riskRuleServiceMap, 'RiskRule');

const checkFraud = catchAsync(async (req: Request, res: Response) => {
    const result = await RiskService.checkFraud(req.body, (req as any).user);
    ApiResponse.success(
        res,
        result,
        "Fraud check completed successfully",
        httpStatus.OK
    );
});

export const RiskSearchController = {
    checkFraud
};

export { blacklistController, riskRuleController };
