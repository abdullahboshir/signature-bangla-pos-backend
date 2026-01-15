import { QueryBuilder } from "@core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import { Warranty } from "./warranty.model.ts";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";

const createWarranty = async (payload: any, user?: any) => {
  // 1. Resolve Business Unit ID first if present
  if (payload.businessUnit) {
    payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any);
  }

  // 2. Auto-detect Company
  if (!payload.company) {
    if (payload.businessUnit) {
      const bu = await BusinessUnit.findById(payload.businessUnit).select('company');
      if (bu && bu.company) {
        payload.company = bu.company;
      }
    }

    if (!payload.company && user?.company) {
      payload.company = user.company._id || user.company;
    }
  }

  const result = await Warranty.create(payload);
  return result;
};

const getAllWarranties = async (query: Record<string, any>) => {
  // 1. Resolve Business Unit Logic
  const finalQuery = await resolveBusinessUnitQuery(query);
  
  const warrantyQuery = new QueryBuilder(
    Warranty.find(),
    finalQuery
  )
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await warrantyQuery.modelQuery;
  const meta = await warrantyQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleWarranty = async (id: string) => {
  const result = await Warranty.findById(id);
  return result;
};

const updateWarranty = async (id: string, payload: any) => {
  const result = await Warranty.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteWarranty = async (id: string) => {
  const result = await Warranty.findByIdAndDelete(id);
  return result;
};

export const WarrantyService = {
  createWarranty,
  getAllWarranties,
  getSingleWarranty,
  updateWarranty,
  deleteWarranty,
};
