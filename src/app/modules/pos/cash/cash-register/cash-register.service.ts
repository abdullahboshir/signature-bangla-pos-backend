import { CashRegister } from "./cash-register.model.ts";
import type { ICashRegister } from "./cash-register.interface.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import { Types } from "mongoose";

import httpStatus from "http-status";
import AppError from "@shared/errors/app-error.ts";

export const getCashRegisterByOutletIdService = async (_outletId: string) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    // Random 4 digit suffix for now, or sequential
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `REG-${dateStr}-${suffix}`;
};

const generateRegisterId = async (_outletId: string) => {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    // Random 4 digit suffix for now, or sequential
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `REG-${dateStr}-${suffix}`;
};

const openRegister = async (payload: Partial<ICashRegister>, userId: string) => {
    // 1. Resolve Business Unit
    if (payload.businessUnit) {
        const resolvedId = await resolveBusinessUnitId(payload.businessUnit);
        if (resolvedId) {
            payload.businessUnit = resolvedId;
        }
    }


    const existingOpen = await CashRegister.findOne({
        outlet: payload.outlet,
        status: 'open'
    });

    if (existingOpen) {
        throw new AppError(httpStatus.BAD_REQUEST, "A register is already open for this outlet.", "REGISTER_ALREADY_OPEN");
    }

    // 3. Generate ID & Defaults
    payload.registerId = await generateRegisterId(payload.outlet?.toString() || "");
    payload.openedBy = new Types.ObjectId(userId);
    payload.openingDate = new Date();
    payload.status = 'open';

    const result = await CashRegister.create(payload);
    return result;
};

const closeRegister = async (id: string, payload: { closingBalance: number; remarks?: string }, userId: string) => {
    const register = await CashRegister.findById(id);

    if (!register) {
        throw new AppError(httpStatus.NOT_FOUND, "Register not found", "REGISTER_NOT_FOUND");
    }

    if (register.status === 'closed') {
        throw new AppError(httpStatus.BAD_REQUEST, "Register is already closed", "REGISTER_ALREADY_CLOSED");
    }

    // Mock system balance for now (In real world, query Sum of Cash Sales since openingDate)
    const systemExpectedBalance = register.openingBalance; // + sales...
    const difference = payload.closingBalance - systemExpectedBalance;

    register.closedBy = new Types.ObjectId(userId);
    register.closingDate = new Date();
    register.closingBalance = payload.closingBalance;
    register.systemExpectedBalance = systemExpectedBalance;
    register.difference = difference;
    register.status = 'closed';
    if (payload.remarks) register.remarks = payload.remarks;

    await register.save();
    return register;
};

const getMyActiveRegister = async (_userId: string, outletId?: string) => {
    const query: any = { status: 'open' };
    if (outletId) query.outlet = outletId;

    const result = await CashRegister.findOne(query)
        .populate("openedBy", "name")
        .populate("businessUnit", "name")
        .populate("outlet", "name");
    return result;
};

const getAllRegisters = async (query: Record<string, unknown>) => {
    const finalQuery = await resolveBusinessUnitQuery(query);

    const registerQuery = new QueryBuilder(
        CashRegister.find()
            .populate("openedBy", "name")
            .populate("closedBy", "name")
            .populate("businessUnit", "name")
            .populate("outlet", "name"),
        finalQuery
    )
        .search(["registerId", "status"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await registerQuery.modelQuery;
    const meta = await registerQuery.countTotal();

    return {
        meta,
        result,
    };
};

export const getCashRegisterByUserIdService = async (_userId: string) => {
    const result = await CashRegister.findById(_userId) // Assuming _userId is actually an ID for a register here based on original getRegisterById
        .populate("openedBy")
        .populate("closedBy")
        .populate("businessUnit")
        .populate("outlet");
    return result;
};

const getRegisterById = async (id: string) => {
    const result = await CashRegister.findById(id)
        .populate("openedBy")
        .populate("closedBy")
        .populate("businessUnit")
        .populate("outlet");
    return result;
};

export const CashRegisterService = {
    openRegister,
    closeRegister,
    getMyActiveRegister,
    getAllRegisters,
    getRegisterById
};
