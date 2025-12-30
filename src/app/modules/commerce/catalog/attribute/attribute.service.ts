import type { IAttribute } from "./attribute.interface.js";
import { Attribute } from "./attribute.model.js";
import { resolveBusinessUnitId } from "../../../../../core/utils/mutation-helper.js";
import { QueryBuilder } from "../../../../../core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "../../../../../core/utils/query-helper.js";

export const createAttributeService = async (payload: IAttribute) => {
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
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
