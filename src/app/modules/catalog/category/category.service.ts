import { Category } from "./category.model.js";
import type { ICategories } from "./category.interface.ts";
import { resolveBusinessUnitId } from "../../../../core/utils/mutation-helper.js";
import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.js";

export const createCategoryService = async (payload: ICategories) => {
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }
  const result = await Category.create(payload);
  return result;
};

export const getCategoriesService = async (query: Record<string, any>) => {
  // 1. Resolve Business Unit Logic
  const finalQuery = await resolveBusinessUnitQuery(query);

  // 2. Build Query
  const categoryQuery = new QueryBuilder(Category.find().populate('businessUnit', 'name slug'), finalQuery)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    result
  };
};

export const getCategoryByIdService = async (id: string) => {
  const result = await Category.findById(id).populate('businessUnit', 'name slug');
  return result;
};
export const updateCategoryService = async (id: string, payload: Partial<ICategories>) => {
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const deleteCategoryService = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  return result;
};
