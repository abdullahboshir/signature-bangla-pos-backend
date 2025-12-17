import type { Types } from "mongoose";
import type { IChildCategory } from "./child-category.interface.js";
import { ChildCategory } from "./child-category.model.js";




import status from 'http-status';
import mongoose from 'mongoose';
import { ApiResponse } from '@core/utils/api-response.ts'; // You might not need this here if you throw errors instead

export const createChildCategoryService = async (payload: IChildCategory) => {
    const result = await ChildCategory.create(payload)
    return result;
}

export const createChildCategoryWithResolution = async (payload: any) => {
    let { subCategory, businessUnit } = payload;

    // Resolve SubCategory
    if (subCategory) {
        const isSubObjectId = mongoose.Types.ObjectId.isValid(subCategory) || /^[0-9a-fA-F]{24}$/.test(subCategory);
        if (!isSubObjectId) {
            const SubCategory = mongoose.model("SubCategory");
            const subDoc = await SubCategory.findOne({
                $or: [{ id: subCategory }, { slug: subCategory }]
            });
            if (!subDoc) {
                throw new Error(`SubCategory Not Found: '${subCategory}'`);
            }
            payload.subCategory = subDoc._id;
        }
    }

    // Resolve Business Unit
    if (businessUnit) {
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });
            if (!buDoc) {
                throw new Error(`Business Unit Not Found: '${businessUnit}'`);
            }
            payload.businessUnit = buDoc._id;
        }
    }

    return await createChildCategoryService(payload);
};



export const getChildCategoriesService = async (subCategoryId: Types.ObjectId) => {
    const result = await ChildCategory.find({ subCategory: subCategoryId }).populate('subCategory');
    console.log(result);
    return result;
};

export const getAllChildCategoriesService = async (query: any) => {
    // Resolve Business Unit if present in query
    if (query.businessUnit) {
        let { businessUnit } = query;
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });
            if (buDoc) {
                query.businessUnit = buDoc._id;
            } else {
                // If invalid BU provided, return empty or handle error. 
                // Returning empty array seems appropriate for a filter
                return [];
            }
        }
    }

    const result = await ChildCategory.find(query).populate('subCategory');
    return result;
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