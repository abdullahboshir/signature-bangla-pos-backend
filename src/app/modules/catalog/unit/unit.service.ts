import type { IUnit } from './unit.interface.ts';
import { Unit } from './unit.model.ts';

import { resolveBusinessUnitId } from '../../../../core/utils/mutation-helper.ts';

const createUnit = async (payload: IUnit, user?: any) => {
    // Resolve BU if needed
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit as any) as any;
    }

    // Auto-detect Company
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

    const result = await Unit.create(payload);
    return result;
};

import { QueryBuilder } from '../../../../core/database/QueryBuilder.ts';
import { resolveBusinessUnitQuery } from '../../../../core/utils/query-helper.ts';

const getAllUnits = async (query: Record<string, unknown> = {}) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const unitQuery = new QueryBuilder(Unit.find().populate('businessUnit'), finalQuery)
        .search(['name'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await unitQuery.modelQuery;
    const meta = await unitQuery.countTotal();

    return {
        meta,
        result
    };
};

const getUnitById = async (id: string) => {
    const result = await Unit.findById(id).populate('businessUnit');
    return result;
};

const updateUnit = async (id: string, payload: Partial<IUnit>) => {
    const result = await Unit.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};

const deleteUnit = async (id: string) => {
    const result = await Unit.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
    );
    return result;
};

export const UnitService = {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
};
