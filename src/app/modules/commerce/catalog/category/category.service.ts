import { Category } from "./category.model.js";
import type { ICategories } from "./category.interface.ts";
import { resolveBusinessUnitId } from '../../../../../core/utils/mutation-helper.js';
import { QueryBuilder } from '../../../../../core/database/QueryBuilder.js';
import { resolveBusinessUnitQuery } from '../../../../../core/utils/query-helper.js';

import httpStatus from "http-status";

export const createCategoryService = async (payload: ICategories) => {
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }

  // Recursive Logic: Check hierarchy depth
  if (payload.parentId) {
    const parent = await Category.findById(payload.parentId);
    if (!parent) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parent category not found");
    }

    // Inherit Business Unit from Parent if not set (or validate match)
    const parentBUId = parent.businessUnit.toString();
    const payloadBUId = payload.businessUnit.toString();

    if (parentBUId !== payloadBUId) {
      throw new AppError(httpStatus.BAD_REQUEST, "Parent category belongs to a different Business Unit");
    }

    payload.level = (parent.level || 0) + 1;
    // Optional: Max depth check
    // if (payload.level > 5) throw new AppError(httpStatus.BAD_REQUEST, "Max category depth exceeded");

  } else {
    payload.level = 0;
  }

  const result = await Category.create(payload);
  return result;
};

import { CacheManager } from '../../../../../core/utils/caching/cache-manager.js';
import AppError from "@shared/errors/app-error.ts";

export const getCategoriesService = async (query: Record<string, any>) => {
  // 1. Resolve Business Unit Logic
  const finalQuery = await resolveBusinessUnitQuery(query);

  // Generate unique cache key based on query
  const cacheKey = `category:list:${JSON.stringify(finalQuery)}`;

  return await CacheManager.wrap(cacheKey, async () => {
    // 2. Build Query
    const categoryQuery = new QueryBuilder(Category.find().populate('businessUnit', 'name slug').populate('parentId', 'name slug'), finalQuery)
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
    return await Category.findById(id).populate('businessUnit', 'name slug').populate('parentId', 'name slug');
  }, 300); // 5 minutes for single item
};

export const updateCategoryService = async (id: string, payload: Partial<ICategories>) => {
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }

  // Logic: Prevent circular parent assignment
  if (payload.parentId && payload.parentId.toString() === id) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category cannot be its own parent");
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
  // Check if children exist
  const children = await Category.findOne({ parentId: id });
  if (children) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot delete category with existing children. Delete or move them first.");
  }

  const result = await Category.findByIdAndDelete(id);
  // Invalidate specific cache
  await CacheManager.del(`category:id:${id}`);
  return result;
};
