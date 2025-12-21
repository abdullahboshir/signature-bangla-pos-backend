import type { IBrand } from "./brand.interface.ts";
import { Brand } from "./brand.model.ts";
import mongoose from "mongoose";

const createBrand = async (payload: IBrand) => {
    // Resolve Business Unit
    if (payload.businessUnit) {
        let businessUnit = payload.businessUnit as any;
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });
            if (buDoc) {
                payload.businessUnit = buDoc._id as any;
            } else {
                throw new Error(`Business Unit Not Found: '${businessUnit}'`);
            }
        }
    }
    const result = await Brand.create(payload);
    return result;
};

const getAllBrands = async (query: any) => {
    const { limit, page, sortBy, sortOrder, searchTerm, fields, ...filters } = query;

    // Resolve Business Unit if present in filters
    if (filters['businessUnit']) {
        let businessUnit = filters['businessUnit'];
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) { // Check if valid ObjectId
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });
            if (buDoc) {
                // Include brands for this Business Unit OR Global (null)
                filters['$or'] = [
                    { businessUnit: buDoc._id },
                    { businessUnit: null },
                    { businessUnit: { $exists: false } }
                ];
                delete filters['businessUnit'];
            } else {
                return [];
            }
        } else {
            // Even if valid ObjectID, we usually want Global too if we are in that context?
            // But usually frontend sends slug for scoping. If ID is sent, assume loose valid.
            // But for consistency with Category service:
            filters['$or'] = [
                { businessUnit: businessUnit },
                { businessUnit: null },
                { businessUnit: { $exists: false } }
            ];
            delete filters['businessUnit'];
        }
    }

    if (searchTerm) {
        filters['name'] = { $regex: searchTerm, $options: 'i' };
    }

    const result = await Brand.find(filters).populate('businessUnit', 'name slug');
    return result;
};

const getBrandById = async (id: string) => {
    const result = await Brand.findById(id);
    return result;
};

const updateBrand = async (id: string, payload: Partial<IBrand>) => {
    const result = await Brand.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteBrand = async (id: string) => {
    const result = await Brand.findByIdAndDelete(id);
    return result;
};

export const BrandService = {
    createBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
};
