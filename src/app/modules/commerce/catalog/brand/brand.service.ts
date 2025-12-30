import type { IBrand } from "./brand.interface.ts";
import { Brand } from "./brand.model.ts";

const createBrand = async (payload: IBrand) => {
    // Resolve Business Unit
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
    }
    const result = await Brand.create(payload);
    return result;
};

import { QueryBuilder } from '../../../../../core/database/QueryBuilder.js';
import { resolveBusinessUnitQuery } from '../../../../../core/utils/query-helper.js';
import { resolveBusinessUnitId } from '../../../../../core/utils/mutation-helper.js';

// ...

const getAllBrands = async (query: any) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const brandQuery = new QueryBuilder(Brand.find().populate('businessUnit', 'name slug'), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await brandQuery.modelQuery;
    const meta = await brandQuery.countTotal();

    return {
        meta,
        result
    };
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
