import { Purchase } from './purchase.model.ts';
import type { IPurchase } from './purchase.interface.ts';

export const createPurchaseService = async (data: IPurchase) => {
    if (!data.id) {
        data.id = `PUR-${Date.now()}`;
    }
    const result = await Purchase.create(data);
    return result;
};

export const getAllPurchasesService = async (filters: any) => {
    const { searchTerm, ...filterData } = filters;
    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            $or: [
                { id: { $regex: searchTerm, $options: 'i' } },
                { referenceNo: { $regex: searchTerm, $options: 'i' } }
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

    // Populate supplier and business unit details
    const result = await Purchase.find(whereConditions)
        .populate('supplier', 'name email')
        .populate('businessUnit', 'name')
        .sort({ createdAt: -1 });

    return result;
};

export const getPurchaseByIdService = async (id: string) => {
    const result = await Purchase.findById(id)
        .populate('supplier')
        .populate('items.product', 'name sku');
    return result;
};

export const updatePurchaseService = async (id: string, payload: Partial<IPurchase>) => {
    const result = await Purchase.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true
    });
    return result;
};

export const deletePurchaseService = async (id: string) => {
    const result = await Purchase.findByIdAndDelete(id);
    return result;
};
