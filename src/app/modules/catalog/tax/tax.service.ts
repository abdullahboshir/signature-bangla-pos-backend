import type { ITax } from "./tax.interface.ts";
import { Tax } from "./tax.model.ts";


import mongoose from "mongoose";

const create = async (payload: ITax) => {
    // Resolve BU if needed
    if (payload.businessUnit) {
        let businessUnit = payload.businessUnit as any;
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit");
            const buDoc = await BusinessUnit.findOne({ $or: [{ id: businessUnit }, { slug: businessUnit }] });
            if (buDoc) payload.businessUnit = buDoc._id as any;
            else throw new Error(`Business Unit Not Found: '${businessUnit}'`);
        }
    }
    const result = await Tax.create(payload);
    return result;
};

const getAll = async (query: Record<string, unknown> = {}) => {
    const { businessUnitId, businessUnit, ...rest } = query;
    const filter: any = { isDeleted: false };

    // Normalize BU input
    let targetBU = businessUnitId || businessUnit;

    if (targetBU) {
        if (typeof targetBU === "string") targetBU = targetBU.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(targetBU as string) || /^[0-9a-fA-F]{24}$/.test(targetBU as string);

        let buId = targetBU;
        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({ $or: [{ id: targetBU }, { slug: targetBU }] });
            if (buDoc) buId = buDoc._id;
            else return [];
        }

        // Fetch Global Taxes + Business Specific Taxes
        filter.$or = [
            { businessUnit: buId },
            { businessUnit: null },
            { businessUnit: { $exists: false } }
        ];
    }

    const result = await Tax.find(filter).sort({ createdAt: -1 });
    return result;
};

const getById = async (id: string) => {
    const result = await Tax.findById(id);
    return result;
};

const update = async (id: string, payload: Partial<ITax>) => {
    const result = await Tax.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteTax = async (id: string) => { // generic controller expects delete
    const result = await Tax.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const TaxService = {
    create,
    getAll,
    getById,
    update,
    delete: deleteTax,
};
