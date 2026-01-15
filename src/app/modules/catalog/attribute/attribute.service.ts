import type { IAttribute } from "./attribute.interface.ts";
import { Attribute } from "./attribute.model.ts";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";
import { resolveBusinessUnitId } from "../../../../core/utils/mutation-helper.ts";
import { QueryBuilder } from "../../../../core/database/QueryBuilder.ts";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.ts";

export const createAttributeService = async (payload: IAttribute, user?: any) => {
    // 1. Resolve Business Unit ID first if present
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
    }

    // 2. Auto-detect Company
    if (!payload.company) {
        // Strategy A: From Business Unit
        if (payload.businessUnit) {
            const bu = await BusinessUnit.findById(payload.businessUnit).select('company');
            if (bu && bu.company) payload.company = bu.company;
        }
        // Strategy B: From User Context
        if (!payload.company && user?.company) {
            payload.company = user.company._id || user.company;
        }
    }

    const result = await Attribute.create(payload);
    return result;
};

export const getAllAttributesService = async (query: Record<string, any>) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const attributeQuery = new QueryBuilder(Attribute.find(), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await attributeQuery.modelQuery;
    const meta = await attributeQuery.countTotal();

    return {
        meta,
        result
    };
};

export const getAttributeByIdService = async (id: string) => {
    const result = await Attribute.findById(id);
    return result;
};

export const updateAttributeService = async (id: string, payload: Partial<IAttribute>) => {
    const result = await Attribute.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

export const deleteAttributeService = async (id: string) => {
    const result = await Attribute.findByIdAndDelete(id);
    return result;
};
