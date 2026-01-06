import { Shareholder, type IShareholder } from "./shareholder.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
import { Types } from "mongoose";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";

const createShareholder = async (payload: Partial<IShareholder>) => {
    // Resolve slug if businessUnit is passed as string
    if (payload.businessUnit && typeof payload.businessUnit === 'string' && !Types.ObjectId.isValid(payload.businessUnit)) {
        const bu = await BusinessUnit.findOne({ slug: payload.businessUnit });
        if (bu) payload.businessUnit = bu._id as Types.ObjectId;
        else throw new AppError(httpStatus.BAD_REQUEST, "Invalid Business Unit Slug");
    }

    // Validate only one scope is set (Business Logic: A shareholder record should be for one context)
    // Actually the model validation handles "at least one", but we should probably ensure they don't mix scopes in one record?
    // Let's assume the payload comes correct from the controller which separates these concerns.

    // Check Existence
    const query: any = { user: payload.user };
    if (payload.company) query.company = payload.company;
    if (payload.businessUnit) query.businessUnit = payload.businessUnit;
    if (payload.outlet) query.outlet = payload.outlet;

    const exists = await Shareholder.findOne(query);

    if (exists) throw new AppError(httpStatus.BAD_REQUEST, "User is already a shareholder in this context");

    const result = await Shareholder.create(payload);
    return result;
};

const getAllShareholders = async (filters: any) => {
    const query: any = {};
    // Dynamic Filter
    if (filters.company) query.company = filters.company;
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;
    if (filters.outlet) query.outlet = filters.outlet;

    const result = await Shareholder.find(query)
        .populate('user', 'name email phone avatar')
        .sort({ equityPercentage: -1 }); // Show big owners first
    return result;
};

const updateShareholder = async (id: string, payload: Partial<IShareholder>) => {
    const result = await Shareholder.findByIdAndUpdate(id, payload, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Shareholder not found");
    return result;
};

const deleteShareholder = async (id: string) => {
    const result = await Shareholder.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Shareholder not found");
    return result;
};

export const ShareholderService = {
    createShareholder,
    getAllShareholders,
    updateShareholder,
    deleteShareholder
};
