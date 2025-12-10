import type { Types } from "mongoose";
import type { IChildCategory } from "./child-category.interface.js";
import { ChildCategory } from "./child-category.model.js";




export const createChildCategoryService = async (payload: IChildCategory) => {
    const result = await ChildCategory.create(payload)
    return result;
}



export const getChildCategoriesService = async (subCategoryId: Types.ObjectId) => {
    const result = await ChildCategory.find({ subCategory: subCategoryId });
    console.log(result);
    return result;
};

export const getAllChildCategoriesService = async () => {
    const result = await ChildCategory.find().populate('subCategory');
    return result;
};