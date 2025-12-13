import type { IUnit } from './unit.interface.ts';
import { Unit } from './unit.model.ts';

const createUnit = async (payload: IUnit) => {
    const result = await Unit.create(payload);
    return result;
};

const getAllUnits = async (query: Record<string, unknown> = {}) => {
    const { businessType, businessUnitId } = query;
    const filter: any = { isDeleted: false };

    if (businessUnitId) {
        // If businessUnitId is provided, fetch Global Units + Specific Units for this business
        filter.$or = [
            { businessUnit: businessUnitId },
            {
                businessUnit: null,
                // If businessType is provided, filter tags. If not, maybe show all globals?
                // Let's assume if type provided, strict match, else loose.
                ...(businessType ? {
                    $or: [
                        { relatedBusinessTypes: { $in: [businessType] } },
                        { relatedBusinessTypes: { $size: 0 } },
                        { relatedBusinessTypes: { $exists: false } }
                    ]
                } : {})
            }
        ];
    } else if (businessType) {
        // Only filtering by type (e.g. searching for valid units for a type)
        filter.$or = [
            { relatedBusinessTypes: { $in: [businessType] } },
            { relatedBusinessTypes: { $size: 0 } },
            { relatedBusinessTypes: { $exists: false } }
        ];
    }

    const result = await Unit.find(filter).populate('businessUnit');
    return result;
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
