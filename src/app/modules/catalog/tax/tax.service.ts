import type { ITax } from "./tax.interface.ts";
import { Tax } from "./tax.model.ts";
import { resolveBusinessUnitId } from '../../../../core/utils/mutation-helper.ts';
import { QueryBuilder } from '../../../../core/database/QueryBuilder.ts';
import { resolveBusinessUnitQuery } from '../../../../core/utils/query-helper.ts';

const create = async (payload: ITax, user?: any) => {
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
    }

    // Auto-detect Organization
    if (!payload.company) {
        if (payload.businessUnit) {
             const BusinessUnit = (await import("../../platform/organization/business-unit/core/business-unit.model.ts")).default;
             const bu = await BusinessUnit.findById(payload.businessUnit).select('company');
             if (bu && bu.company) payload.company = bu.company;
        }
        if (!payload.company && user?.company) {
            payload.company = user.company._id || user.company;
        }
    }

    const result = await Tax.create(payload);
    return result;
};

const getAll = async (query: Record<string, unknown> = {}) => {
    // Use centralized BU resolution
    const finalQuery = await resolveBusinessUnitQuery(query);

    // Build query with QueryBuilder
    const taxQuery = new QueryBuilder(
        Tax.find().populate('businessUnit', 'name slug'),
        finalQuery
    )
        .search(['name', 'rate'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await taxQuery.modelQuery;
    const meta = await taxQuery.countTotal();

    return {
        meta,
        result
    };
};

const getById = async (id: string) => {
    const result = await Tax.findById(id);
    return result;
};

const update = async (id: string, payload: Partial<ITax>) => {
    const result = await Tax.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteTax = async (id: string) => { // generic controller expects delete
    const result = await Tax.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const TaxService = {
    create,
    getAll,
    getById,
    update,
    delete: deleteTax,
};
