import { Supplier } from './supplier.model.ts';
import type { ISupplier } from './supplier.interface.ts';

export const createSupplierService = async (data: ISupplier) => {
    // Generate simple ID if not present
    if (!data.id) {
        data.id = `SUP-${Date.now()}`;
    }
    const result = await Supplier.create(data);
    return result;
};

export const getAllSuppliersService = async (filters: any) => {
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } },
                { id: { $regex: searchTerm, $options: 'i' } }
            ]
        });
    }

    if (Object.keys(filterData).length) {
        andConditions.push({
            $and: Object.entries(filterData).map(([field, value]) => ({
                [field]: value
            }))
        });
    }

    const whereConditions = andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await Supplier.find(whereConditions).sort({ createdAt: -1 });
    return result;
};

export const getSupplierByIdService = async (id: string) => {
    const result = await Supplier.findById(id);
    return result;
};

export const updateSupplierService = async (id: string, payload: Partial<ISupplier>) => {
    const result = await Supplier.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
};

export const deleteSupplierService = async (id: string) => {
    const result = await Supplier.findByIdAndDelete(id);
    return result;
};
