import { Types } from "mongoose";
import type { ISubCategory } from "../sub-category/sub-category.interface.js";
import { Category } from "./category.model.js";

export const createCategoryService = async (payload: ISubCategory) => {
  const result = await Category.create(payload);
  return result;
};

export const getCategoriesService = async (
  businessUnitId: Types.ObjectId | string | null
) => {
    let result;
    
    if (businessUnitId === null) {
    result = await Category.find({});
    return result;
  } else {
    result = await Category.find({ businessUnit: businessUnitId });
    return result;
  }
};
