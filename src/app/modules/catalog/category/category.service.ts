import { Category } from "./category.model.ts";
import type { ICategories } from "./category.interface.ts";
import { resolveBusinessUnitId } from '../../../../core/utils/mutation-helper.ts';
import { QueryBuilder } from '../../../../core/database/QueryBuilder.ts';
import { resolveBusinessUnitQuery } from '../../../../core/utils/query-helper.ts';

import httpStatus from "http-status";

import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";

export const createCategoryService = async (payload: ICategories, user?: any) => {
  // 1. Resolve Business Unit ID first if present
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
  }

  // 2. Auto-detect Company
  if (!payload.company) {
    // Strategy A: From Business Unit (Context Awareness)
    if (payload.businessUnit) {
      const bu = await BusinessUnit.findById(payload.businessUnit).select('company');
      if (bu && bu.company) {
        payload.company = bu.company;
      }
    }

    // Strategy B: From User Context (Fallback)
    if (!payload.company && user?.company) {
      payload.company = user.company._id || user.company;
    }
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

import { CacheManager } from '../../../../core/utils/caching/cache-manager.ts';
import AppError from "@shared/errors/app-error.ts";
import { Product } from "../product/domain/product-core/product.model.ts";

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
  // 1. Check if children categories exist
  const children = await Category.findOne({ parentId: id });
  if (children) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category with existing sub-categories. Delete or move them first."
    );
  }

  // 2. Check if any products reference this category

  const productsUsingCategory = await Product.findOne({
    $or: [
      { category: id },
      { 'categories': id } // If you have multiple categories support
    ]
  });

  if (productsUsingCategory) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot delete category. Products are using this category. Please update or delete those products first."
    );
  }

  // 3. Safe to delete
  const result = await Category.findByIdAndDelete(id);

  // Invalidate caches
  await CacheManager.del(`category:id:${id}`);

  return result;
};
