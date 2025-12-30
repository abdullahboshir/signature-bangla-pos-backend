import type { ITax } from "./tax.interface.ts";
import { Tax } from "./tax.model.ts";
import { resolveBusinessUnitId } from '../../../../../core/utils/mutation-helper.js';
import { QueryBuilder } from '../../../../../core/database/QueryBuilder.js';
import { resolveBusinessUnitQuery } from '../../../../../core/utils/query-helper.js';

const create = async (payload: ITax) => {
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
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
