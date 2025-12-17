import type { Types } from "mongoose";
import type { ISubCategory } from "./sub-category.interface.js";
import { SubCategory } from "./sub-category.model.js";
import mongoose from "mongoose";



export const createSubCategoryService = async (payload: ISubCategory) => {
    const result = await SubCategory.create(payload)
    return result;
}

export const createSubCategoryWithResolution = async (payload: any) => {
    let { category, businessUnit } = payload;

    // Resolve Category
    if (category) {
        const isCatObjectId = mongoose.Types.ObjectId.isValid(category) || /^[0-9a-fA-F]{24}$/.test(category);
        if (!isCatObjectId) {
            const Category = mongoose.model("Category");
            const catDoc = await Category.findOne({
                $or: [{ id: category }, { slug: category }]
            });
            if (!catDoc) {
                throw new Error(`Category Not Found: '${category}'`);
            }
            payload.category = catDoc._id;
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

    return await createSubCategoryService(payload);
};


export const getSubCategoriesService = async (categoryId: Types.ObjectId) => {
    const result = await SubCategory.find({ category: categoryId }).populate('category'); // Keep existing for specific fetch
    return result;
};

export const getAllSubCategoriesService = async (query: any) => {
    const { limit, page, sortBy, sortOrder, searchTerm, fields, ...filters } = query;

    // Resolve Business Unit if present in filters
    if (filters.businessUnit) {
        let { businessUnit } = filters;
        if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
        const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

        if (!isBuObjectId) {
            const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
            const buDoc = await BusinessUnit.findOne({
                $or: [{ id: businessUnit }, { slug: businessUnit }]
            });
            if (buDoc) {
                filters.businessUnit = buDoc._id;
            } else {
                return [];
            }
        }
    }

    if (searchTerm) {
        filters['name'] = { $regex: searchTerm, $options: 'i' };
    }

    const result = await SubCategory.find(filters).populate('category');
    return result;
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