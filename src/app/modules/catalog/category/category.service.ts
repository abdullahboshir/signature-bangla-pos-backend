

import { Category } from "./category.model.js";
import mongoose from "mongoose";
import type { ICategories } from "./category.interface.ts";

export const createCategoryService = async (payload: ICategories) => {
  // Resolve Business Unit
  if (payload.businessUnit) {
    let businessUnit = payload.businessUnit as any;
    if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
    const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isBuObjectId) {
      const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
      const buDoc = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });
      if (buDoc) {
        payload.businessUnit = buDoc._id as any;
      } else {
        throw new Error(`Business Unit Not Found: '${businessUnit}'`);
      }
    }
  }

  const result = await Category.create(payload);
  return result;
};

export const getCategoriesService = async (
  query: Record<string, any>
) => {
  const { limit, page, sortBy, sortOrder, searchTerm, fields, ...filters } = query;

  // Resolve Business Unit if present in filters
  if (filters['businessUnit']) {
    let businessUnit = filters['businessUnit'];
    if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
    const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isBuObjectId) { // Check if valid ObjectId
      const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
      const buDoc = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });
      if (buDoc) {
        // Include categories for this Business Unit OR Global (null)
        filters['$or'] = [
          { businessUnit: buDoc._id },
          { businessUnit: null },
          { businessUnit: { $exists: false } }
        ];
        // Remove the direct businessUnit match to avoid conflict (though $or takes precedence usually)
        delete filters['businessUnit'];
      } else {
        return [];
      }
    }
  }

  // Handle searchTerm (partial match on name)
  if (searchTerm) {
    filters['name'] = { $regex: searchTerm, $options: 'i' };
  }

  const result = await Category.find(filters).populate('businessUnit', 'name slug');
  return result;
};

export const getCategoryByIdService = async (id: string) => {
  const result = await Category.findById(id).populate('businessUnit', 'name slug');
  return result;
};
export const updateCategoryService = async (id: string, payload: Partial<ICategories>) => {
  // Resolve Business Unit
  if (payload.businessUnit) {
    let businessUnit = payload.businessUnit as any;
    if (typeof businessUnit === "string") businessUnit = businessUnit.trim();
    const isBuObjectId = mongoose.Types.ObjectId.isValid(businessUnit) || /^[0-9a-fA-F]{24}$/.test(businessUnit);

    if (!isBuObjectId) {
      const BusinessUnit = mongoose.model("BusinessUnit"); // Dynamic import
      const buDoc = await BusinessUnit.findOne({
        $or: [{ id: businessUnit }, { slug: businessUnit }]
      });
      if (buDoc) {
        payload.businessUnit = buDoc._id as any;
      } else {
        throw new Error(`Business Unit Not Found: '${businessUnit}'`);
      }
    }
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
