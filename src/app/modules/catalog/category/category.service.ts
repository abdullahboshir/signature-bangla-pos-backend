import { Types } from "mongoose";

import { Category } from "./category.model.js";
import type { ICategories } from "./category.interface.ts";

export const createCategoryService = async (payload: ICategories) => {
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
