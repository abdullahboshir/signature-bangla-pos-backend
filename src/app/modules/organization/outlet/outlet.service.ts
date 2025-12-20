import type { IOutlet } from "./outlet.interface.ts";
import { Outlet } from "./outlet.model.ts";
import BusinessUnit from "../business-unit/business-unit.model.ts";
import { Types } from "mongoose";
// import ApiError from "../../../../errors/ApiError.js";
import httpStatus from "http-status";

const createOutlet = async (payload: IOutlet): Promise<IOutlet> => {
    // Resolve Business Unit ID if it's a string (ULID)
    if (typeof payload.businessUnit === 'string' && !Types.ObjectId.isValid(payload.businessUnit)) {
        const bu = await BusinessUnit.findOne({ id: payload.businessUnit });
        if (!bu) {
            throw new Error("Business Unit not found with the provided ID");
        }
        payload.businessUnit = bu._id as Types.ObjectId;
    }

    // Check if code exists in the same business unit
    const isExist = await Outlet.isCodeTaken(payload.code, payload.businessUnit.toString());
    if (isExist) {
        throw new Error("Outlet code already exists in this Business Unit");
    }
    const result = await Outlet.create(payload);
    return result;
};

const getAllOutlets = async (businessUnitId: string): Promise<IOutlet[]> => {
    let query: any = { businessUnit: businessUnitId };

    // Resolve Business Unit ID if it's a string (ULID)
    if (businessUnitId && !Types.ObjectId.isValid(businessUnitId)) {
        const bu = await BusinessUnit.findOne({ id: businessUnitId });
        if (bu) {
            query = { businessUnit: bu._id };
        } else {
            // If invalid ID passed, return empty or throw? Return empty is safer.
            return [];
        }
    }

    const result = await Outlet.find(query)
        .populate("manager", "name email")
        .sort({ createdAt: -1 });
    return result;
};

const getOutletById = async (id: string): Promise<IOutlet | null> => {
    const result = await Outlet.findById(id).populate("manager", "name email");
    return result;
};

const updateOutlet = async (id: string, payload: Partial<IOutlet>): Promise<IOutlet | null> => {
    const isExist = await Outlet.findById(id);
    if (!isExist) {
        throw new Error("Outlet not found");
    }

    // specific check for code uniqueness if updating code
    if (payload.code && payload.code !== isExist.code) {
        const isCodeExist = await Outlet.isCodeTaken(payload.code, isExist.businessUnit.toString());
        if (isCodeExist) {
            throw new Error("Outlet code already exists in this Business Unit");
        }
    }

    const result = await Outlet.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
};

const deleteOutlet = async (id: string): Promise<IOutlet | null> => {
    const result = await Outlet.findByIdAndDelete(id);
    return result;
};

export const OutletService = {
    createOutlet,
    getAllOutlets,
    getOutletById,
    updateOutlet,
    deleteOutlet
};
