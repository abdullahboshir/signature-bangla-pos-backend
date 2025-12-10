import type { Types } from "mongoose";
import type { ISubCategory } from "./sub-category.interface.js";
import { SubCategory } from "./sub-category.model.js";



export const createSubCategoryService = async (payload: ISubCategory) => {
    const result = await SubCategory.create(payload)
    return result;
}


export const getSubCategoriesService = async (categoryId: Types.ObjectId) => {
    const result = await SubCategory.find({ category: categoryId }); // Keep existing for specific fetch
    return result;
};

export const getAllSubCategoriesService = async () => {
    const result = await SubCategory.find().populate('category');
    return result;
};