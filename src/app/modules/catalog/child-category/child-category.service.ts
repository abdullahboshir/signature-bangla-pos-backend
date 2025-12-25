import type { Types } from "mongoose";
import type { IChildCategory } from "./child-category.interface.js";
import { ChildCategory } from "./child-category.model.js";
import { resolveBusinessUnitId } from "../../../../core/utils/mutation-helper.js";
import mongoose from 'mongoose';

export const createChildCategoryService = async (payload: IChildCategory) => {
    const result = await ChildCategory.create(payload)
    return result;
}

export const createChildCategoryWithResolution = async (payload: any) => {
    // Resolve SubCategory
    if (payload.subCategory) {
        const isSubObjectId = mongoose.Types.ObjectId.isValid(payload.subCategory) && /^[0-9a-fA-F]{24}$/.test(payload.subCategory);
        if (!isSubObjectId) {
            const SubCategory = mongoose.model("SubCategory");
            const subDoc = await SubCategory.findOne({
                $or: [{ id: payload.subCategory }, { slug: payload.subCategory }]
            });
            if (!subDoc) {
                throw new Error(`SubCategory Not Found: '${payload.subCategory}'`);
            }
            payload.subCategory = subDoc._id;
        }
    }

    // Resolve Business Unit using helper
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit);
    }

    return await createChildCategoryService(payload);
};



export const getChildCategoriesService = async (subCategoryId: Types.ObjectId) => {
    const result = await ChildCategory.find({ subCategory: subCategoryId }).populate('subCategory');
    console.log(result);
    return result;
};

import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.js";

// ...

export const getAllChildCategoriesService = async (query: any) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const childCatQuery = new QueryBuilder(ChildCategory.find().populate('subCategory'), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await childCatQuery.modelQuery;
    const meta = await childCatQuery.countTotal();

    return {
        meta,
        result
    };
};

export const getChildCategoryByIdService = async (id: string) => {
    const result = await ChildCategory.findById(id).populate('subCategory');
    return result;
};

export const updateChildCategoryService = async (id: string, payload: Partial<IChildCategory>) => {
    const result = await ChildCategory.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

export const deleteChildCategoryService = async (id: string) => {
    const result = await ChildCategory.findByIdAndDelete(id);
    return result;
};