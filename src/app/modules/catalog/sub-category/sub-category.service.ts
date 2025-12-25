import type { Types } from "mongoose";
import type { ISubCategory } from "./sub-category.interface.js";
import { SubCategory } from "./sub-category.model.js";
import { resolveBusinessUnitId } from "../../../../core/utils/mutation-helper.js";
import mongoose from "mongoose";

export const createSubCategoryService = async (payload: ISubCategory) => {
    const result = await SubCategory.create(payload)
    return result;
}

export const createSubCategoryWithResolution = async (payload: any) => {
    // Resolve Category (similar pattern to BU)
    if (payload.category) {
        const isCatObjectId = mongoose.Types.ObjectId.isValid(payload.category) && /^[0-9a-fA-F]{24}$/.test(payload.category);
        if (!isCatObjectId) {
            const Category = mongoose.model("Category");
            const catDoc = await Category.findOne({
                $or: [{ id: payload.category }, { slug: payload.category }]
            });
            if (!catDoc) {
                throw new Error(`Category Not Found: '${payload.category}'`);
            }
            payload.category = catDoc._id;
        }
    }

    // Resolve Business Unit using helper
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit);
    }

    return await createSubCategoryService(payload);
};


export const getSubCategoriesService = async (categoryId: Types.ObjectId) => {
    const result = await SubCategory.find({ category: categoryId }).populate('category'); // Keep existing for specific fetch
    return result;
};

import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.js";

// ...

export const getAllSubCategoriesService = async (query: any) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const subCategoryQuery = new QueryBuilder(SubCategory.find().populate('category'), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await subCategoryQuery.modelQuery;
    const meta = await subCategoryQuery.countTotal();

    return {
        meta,
        result
    };
};

export const getSubCategoryByIdService = async (id: string) => {
    const result = await SubCategory.findById(id).populate('category');
    return result;
};

export const updateSubCategoryService = async (id: string, payload: Partial<ISubCategory>) => {
    const result = await SubCategory.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

export const deleteSubCategoryService = async (id: string) => {
    const result = await SubCategory.findByIdAndDelete(id);
    return result;
};