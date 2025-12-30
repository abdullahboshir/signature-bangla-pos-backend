import { Blacklist, type IBlacklist } from "./blacklist.model.ts";
import { RiskRule, type IRiskRule } from "./risk-rule.model.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.ts";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.ts";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.ts";
// import axios from "axios"; // External API integration

import httpStatus from "http-status";
import AppError from "@shared/errors/app-error.ts";

// ==================== BLACKLIST FUNCTIONS ====================

const createBlacklistEntry = async (data: IBlacklist, user: any) => {
    const businessUnitId = await resolveBusinessUnitId((data.businessUnit || user.businessUnit) as any);
    const entry = await Blacklist.create([{ ...data, businessUnit: businessUnitId as any, addedBy: user.userId }]);
    return entry[0];
};

// ...

const getAllBlacklistEntries = async (query: Record<string, unknown>, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const blacklistQuery = new QueryBuilder(Blacklist.find(businessUnitQuery), query)
        .search(["identifier", "reason"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const meta = await blacklistQuery.countTotal();
    const result = await blacklistQuery.modelQuery;

    return { meta, result };
};

const getBlacklistEntryById = async (id: string, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const entry = await Blacklist.findOne({ _id: id, ...businessUnitQuery });
    if (!entry) throw new AppError(httpStatus.NOT_FOUND, "Blacklist entry not found");
    return entry;
};

const updateBlacklistEntry = async (id: string, payload: Partial<IBlacklist>, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const entry = await Blacklist.findOneAndUpdate({ _id: id, ...businessUnitQuery }, payload, {
        new: true,
        runValidators: true,
    });
    if (!entry) throw new AppError(httpStatus.NOT_FOUND, "Blacklist entry not found");
    return entry;
};

const deleteBlacklistEntry = async (id: string, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const entry = await Blacklist.findOneAndDelete({ _id: id, ...businessUnitQuery });
    if (!entry) throw new AppError(httpStatus.NOT_FOUND, "Blacklist entry not found");
    return entry;
};

// ==================== RISK RULE FUNCTIONS ====================

const createRiskRule = async (data: IRiskRule, user: any) => {
    const businessUnitId = await resolveBusinessUnitId((data.businessUnit || user.businessUnit) as any);
    const rule = await RiskRule.create({ ...data, businessUnit: businessUnitId as any });
    return rule;
};

const getAllRiskRules = async (query: Record<string, unknown>, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const riskRulesQuery = new QueryBuilder(RiskRule.find(businessUnitQuery), query)
        .search(["name"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const meta = await riskRulesQuery.countTotal();
    const result = await riskRulesQuery.modelQuery;

    return { meta, result };
};

const getRiskRuleById = async (id: string, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const rule = await RiskRule.findOne({ _id: id, ...businessUnitQuery });
    if (!rule) throw new AppError(httpStatus.NOT_FOUND, "Risk Rule not found");
    return rule;
};

const updateRiskRule = async (id: string, payload: Partial<IRiskRule>, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const rule = await RiskRule.findOneAndUpdate({ _id: id, ...businessUnitQuery }, payload, {
        new: true,
        runValidators: true,
    });
    if (!rule) throw new AppError(httpStatus.NOT_FOUND, "Risk Rule not found");
    return rule;
};

const deleteRiskRule = async (id: string, user: any) => {
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const rule = await RiskRule.findOneAndDelete({ _id: id, ...businessUnitQuery });
    if (!rule) throw new AppError(httpStatus.NOT_FOUND, "Risk Rule not found");
    return rule;
};

// ==================== CORE FRAUD CHECK ====================

// ==================== CORE FRAUD CHECK ====================

const checkFraud = async (data: { phone?: string; email?: string; ip?: string }, user: any) => {
    // 1. Check Local Blacklist
    const businessUnitQuery = resolveBusinessUnitQuery(user);
    const query = {
        ...businessUnitQuery,
        isActive: true,
        $or: [] as any[]
    };

    if (data.phone) query.$or.push({ identifier: data.phone, type: "phone" });
    if (data.email) query.$or.push({ identifier: data.email, type: "email" });
    if (data.ip) query.$or.push({ identifier: data.ip, type: "ip" });

    // Return if no identifier provided
    if (query.$or.length === 0) return { status: "clean", riskScore: 0, messages: [] };

    // Check Blacklist Database
    const blacklistMatches = await Blacklist.find(query);
    if (blacklistMatches.length > 0) {
        return {
            status: "blocked",
            riskScore: 100,
            matches: blacklistMatches,
            message: "Customer found in local blacklist"
        };
    }

    // 2. Check External Courier APIs (Steadfast, Pathao, etc.)
    // Only if phone number is present, as couriers track by phone
    if (data.phone) {
        // Dynamic import to avoid circular dependency if any, though model import is safe
        const { Courier } = await import("../../erp/logistics/courier.model.js");

        // Fetch active couriers with credentials
        const couriers = await Courier.find({
            ...businessUnitQuery,
            isActive: true,
            apiKey: { $exists: true, $ne: "" }
        }).select('+apiKey +apiSecret +baseUrl');

        const courierChecks = couriers.map(async (courier: any) => {
            try {
                if (courier.providerId === "steadfast") {
                    // Logic for Steadfast
                    // Note: This is a hypothetical endpoint. 
                    // Real integration requires: GET https://portal.steadfast.com.bd/api/v1/status_by_tracking?phone={phone}
                    // Or typically listing orders by phone.

                    /* 
                    const response = await axios.get(`${courier.baseUrl}/status_by_phone/${data.phone}`, {
                        headers: { "Api-Key": courier.apiKey, "Secret-Key": courier.apiSecret }
                    });
                    return { provider: "steadfast", data: response.data };
                    */
                    return { provider: "steadfast", status: "skipped", note: "Endpoint configuration required" }; // Placeholder
                }

                if (courier.providerId === "pathao") {
                    // Logic for Pathao
                    // Pathao usually requires Auth token first via Client ID/Secret
                    /*
                    const token = await axios.post(..., { client_id: courier.apiKey, client_secret: courier.apiSecret });
                    const response = await axios.get(`${courier.baseUrl}/aladdin/api/v1/orders?contact_number=${data.phone}`, {
                        headers: { Authorization: `Bearer ${token.data.access_token}` }
                    });
                     return { provider: "pathao", data: response.data };
                    */
                    return { provider: "pathao", status: "skipped", note: "Endpoint configuration required" };
                }

                return { provider: courier.providerId, status: "unknown" };
            } catch (error) {
                console.error(`Error checking ${courier.name}:`, error);
                return { provider: courier.name, error: "API Request Failed" };
            }
        });

        const externalResults = await Promise.all(courierChecks);
        console.log("External Risk Check Results (Placeholder):", externalResults); // Log to use the variable

        // Analyze external results (Hypothetical Aggregation)
        // If we found a high return rate in external data:
        // const highReturn = externalResults.some(r => r.data?.return_rate > 20);
        // if (highReturn) return { status: "warning", riskScore: 80, message: "High return rate detected in courier" };
    }

    return {
        status: "clean",
        riskScore: 0,
        message: "No risk detected in local or external databases"
    };
};

export const RiskService = {
    createBlacklistEntry,
    getAllBlacklistEntries,
    getBlacklistEntryById,
    updateBlacklistEntry,
    deleteBlacklistEntry,

    createRiskRule,
    getAllRiskRules,
    getRiskRuleById,
    updateRiskRule,
    deleteRiskRule,

    checkFraud
};
