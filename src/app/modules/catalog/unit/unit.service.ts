import type { IUnit } from './unit.interface.ts';
import { Unit } from './unit.model.ts';

import mongoose from "mongoose"; // Added import

const createUnit = async (payload: IUnit) => {
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
    const result = await Unit.create(payload);
    return result;
};

const getAllUnits = async (query: Record<string, unknown> = {}) => {
    const { businessType, businessUnitId, businessUnit, ...rest } = query;
    const filter: any = { isDeleted: false };

    // Normalize BU input
    let targetBU = businessUnitId || businessUnit;

    if (targetBU) {
        if (typeof targetBU === "string") targetBU = targetBU.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(targetBU as string) || /^[0-9a-fA-F]{24}$/.test(targetBU as string);

        let buId = targetBU;
        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit");
            const buDoc = await BusinessUnit.findOne({ $or: [{ id: targetBU }, { slug: targetBU }] });
            if (buDoc) buId = buDoc._id;
            else return [];
        }

        // Global + Specific
        filter.$or = [
            { businessUnit: buId },
            {
                businessUnit: null,
                ...(businessType ? {
                    $or: [
                        { relatedBusinessTypes: { $in: [businessType] } },
                        { relatedBusinessTypes: { $size: 0 } },
                        { relatedBusinessTypes: { $exists: false } }
                    ]
                } : {})
            },
            { businessUnit: { $exists: false } }
        ];
    } else if (businessType) {
        filter.$or = [
            { relatedBusinessTypes: { $in: [businessType] } },
            { relatedBusinessTypes: { $size: 0 } },
            { relatedBusinessTypes: { $exists: false } }
        ];
    }

    const result = await Unit.find(filter).populate('businessUnit');
    return result;
};

const getUnitById = async (id: string) => {
    const result = await Unit.findById(id).populate('businessUnit');
    return result;
};

const updateUnit = async (id: string, payload: Partial<IUnit>) => {
    const result = await Unit.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteUnit = async (id: string) => {
    const result = await Unit.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const UnitService = {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
};
