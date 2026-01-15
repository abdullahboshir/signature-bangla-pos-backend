import type { IAttributeGroup } from "./attribute-group.interface.ts";
import { AttributeGroup } from "./attribute-group.model.ts";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";
import { resolveBusinessUnitId } from "../../../../core/utils/mutation-helper.ts";


const createAttributeGroup = async (payload: IAttributeGroup, user?: any) => {
    // 1. Resolve Business Unit ID first if present
    if (payload.businessUnit) {
        // Note: resolveBusinessUnitId needs import if not present. 
        // Assuming it is available or needs import. 
        // Checking file context, imported in other files.
        // Let's safe import it or use it if available.
        // Wait, current file didn't show it imported.
        // I will trust the user to have it or I will add it.
        // Actually, better to just use what is needed.
        // Let's stick to the pattern.
        // I need to import resolveBusinessUnitId too.
    }
    
    // Reworking logic to include imports in separate call if needed.
    // For now, focusing on function body.
    
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

    const result = await AttributeGroup.create(payload);
    return result;
};

import { QueryBuilder } from "../../../../core/database/QueryBuilder.ts";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.ts";

// ...

const getAllAttributeGroups = async (query: Record<string, unknown> = {}) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const attributeGroupQuery = new QueryBuilder(AttributeGroup.find(), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await attributeGroupQuery.modelQuery;
    const meta = await attributeGroupQuery.countTotal();

    return {
        meta,
        result
    };
};

const getAttributeGroupById = async (id: string) => {
    const result = await AttributeGroup.findById(id);
    return result;
};

const updateAttributeGroup = async (id: string, payload: Partial<IAttributeGroup>) => {
    const result = await AttributeGroup.findByIdAndUpdate(id, payload, { new: true });
    return result;
};

const deleteAttributeGroup = async (id: string) => {
    const result = await AttributeGroup.findByIdAndDelete(id);
    return result;
};

export const AttributeGroupService = {
    createAttributeGroup,
    getAllAttributeGroups,
    getAttributeGroupById,
    updateAttributeGroup,
    deleteAttributeGroup
};
