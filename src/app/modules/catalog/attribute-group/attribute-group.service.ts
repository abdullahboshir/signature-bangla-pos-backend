import type { IAttributeGroup } from "./attribute-group.interface.ts";
import { AttributeGroup } from "./attribute-group.model.js";


const createAttributeGroup = async (payload: IAttributeGroup) => {
    const result = await AttributeGroup.create(payload);
    return result;
};

import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "../../../../core/utils/query-helper.js";

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
