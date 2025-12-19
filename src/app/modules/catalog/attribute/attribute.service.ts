import mongoose from "mongoose";
import type { IAttribute } from "./attribute.interface.js";
import { Attribute } from "./attribute.model.js";

export const createAttributeService = async (payload: IAttribute) => {
    // Resolve Business Unit if passed as string (copying pattern from other services)
    if (payload.businessUnit && typeof payload.businessUnit === 'string') {
        const buId = payload.businessUnit as string;
        const isBuObjectId = mongoose.Types.ObjectId.isValid(buId) || /^[0-9a-fA-F]{24}$/.test(buId);
        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: buId }, { slug: buId }]
            });
            if (buDoc) payload.businessUnit = buDoc._id;
            else throw new Error(`Business Unit Not Found: '${buId}'`);
        }
    }

    const result = await Attribute.create(payload);
    return result;
};

export const getAllAttributesService = async (query: Record<string, any>) => {
    const { searchTerm, page, limit, sortBy, sortOrder, fields, ...filters } = query;

    // Pagination defaults
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 0; // 0 means no limit (all) if not specified, or use default e.g. 10
    const skip = (pageNumber - 1) * limitNumber;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            name: { $regex: searchTerm, $options: "i" }
        });
    }

    if (Object.keys(filters).length) {
        andConditions.push({
            $and: Object.entries(filters).map(([field, value]) => ({
                [field]: value
            }))
        });
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    // Sort logic
    const sortConditions: { [key: string]: any } = {};
    if (sortBy) {
        sortConditions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
        sortConditions['createdAt'] = -1;
    }

    const queryBuilder = Attribute.find(whereConditions)
        .sort(sortConditions);

    if (limitNumber > 0) {
        queryBuilder.skip(skip).limit(limitNumber);
    }

    const result = await queryBuilder;
    return result;
};

export const getAttributeByIdService = async (id: string) => {
    const result = await Attribute.findById(id);
    return result;
};

export const updateAttributeService = async (id: string, payload: Partial<IAttribute>) => {
    const result = await Attribute.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

export const deleteAttributeService = async (id: string) => {
    const result = await Attribute.findByIdAndDelete(id);
    return result;
};
