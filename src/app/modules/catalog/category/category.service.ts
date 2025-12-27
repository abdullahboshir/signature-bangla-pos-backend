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

import { CacheManager } from "../../../../core/utils/caching/cache-manager.js";

export const getCategoriesService = async (query: Record<string, any>) => {
  // 1. Resolve Business Unit Logic
  const finalQuery = await resolveBusinessUnitQuery(query);

  // Generate unique cache key based on query
  const cacheKey = `category:list:${JSON.stringify(finalQuery)}`;

  return await CacheManager.wrap(cacheKey, async () => {
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
  }, 60); // Cache for 60 seconds
};

export const getCategoryByIdService = async (id: string) => {
  const cacheKey = `category:id:${id}`;
  return await CacheManager.wrap(cacheKey, async () => {
    return await Category.findById(id).populate('businessUnit', 'name slug');
  }, 300); // 5 minutes for single item
};

export const updateCategoryService = async (id: string, payload: Partial<ICategories>) => {
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }

  const result = await Category.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  // Invalidate specific cache
  await CacheManager.del(`category:id:${id}`);
  return result;
};

export const deleteCategoryService = async (id: string) => {
  const result = await Category.findByIdAndDelete(id);
  // Invalidate specific cache
  await CacheManager.del(`category:id:${id}`);
  return result;
};
