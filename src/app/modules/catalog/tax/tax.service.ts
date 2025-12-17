import type { ITax } from "./tax.interface.ts";
import { Tax } from "./tax.model.ts";


const create = async (payload: ITax) => {
    // If setting as default, unset other defaults for the same business unit?
    // For simplicity, let's just create for now. Enhancement: Handle unique default logic.
    const result = await Tax.create(payload);
    return result;
};

const getAll = async (query: Record<string, unknown> = {}) => {
    const { businessUnitId } = query;
    const filter: any = { isDeleted: false };

    if (businessUnitId) {
        // Fetch Global Taxes + Business Specific Taxes
        filter.$or = [
            { businessUnit: businessUnitId },
            { businessUnit: null }
        ];
    }

    const result = await Tax.find(filter).sort({ createdAt: -1 });
    return result;
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
