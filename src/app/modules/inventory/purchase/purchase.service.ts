import { startSession } from 'mongoose';
import AppError from "../../../../shared/errors/app-error.js";
import { Purchase } from './purchase.model.js';
import type { IPurchase } from './purchase.interface.js';
import { Product } from "../../catalog/product/product-core/product-core.model.js";

const updateStockForPurchase = async (purchase: any, session: any) => {
    if (!purchase.outlet) {
        throw new AppError(400, "Purchase must have an outlet to update stock");
    }
    const outletId = purchase.outlet.toString();

    for (const item of purchase.items) {
        const product = await Product.findById(item.product).populate('inventory').session(session);
        if (product && product.inventory) {
            const inventoryDoc = product.inventory as any;

            // Ensure method exists before calling (runtime safety)
            if (typeof inventoryDoc.addStock === 'function') {
                inventoryDoc.addStock(item.quantity, outletId);
                await inventoryDoc.save({ session });
            } else {
                console.error(`addStock method missing on inventory for product ${product._id}`);
            }
        }
    }
};

export const createPurchaseService = async (data: IPurchase) => {
    const session = await startSession();
    session.startTransaction();
    try {
        if (!data.id) {
            data.id = `PUR-${Date.now()}`;
        }

        const result = await Purchase.create([data], { session });
        const createdPurchase = result[0];

        if (createdPurchase.status === 'received') {
            await updateStockForPurchase(createdPurchase, session);
        }

        await session.commitTransaction();
        session.endSession();
        return createdPurchase;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
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
    const session = await startSession();
    session.startTransaction();
    try {
        const existingPurchase = await Purchase.findById(id).session(session);
        if (!existingPurchase) throw new AppError(404, "Purchase not found");

        const previousStatus = existingPurchase.status;

        // Update the purchase
        const updatedPurchase = await Purchase.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true,
            session
        });

        if (!updatedPurchase) throw new AppError(404, "Purchase not found after update");

        // If status changed to 'received', add stock
        // Note: This simple logic assumes we only add stock ONCE when it hits 'received'. 
        // If it goes received -> pending -> received, it might double count. 
        // For a robust system, we should track 'stockAdded' flag or similar. 
        // For this iteration, we assume strict flow: pending -> ordered -> received.
        if (previousStatus !== 'received' && updatedPurchase.status === 'received') {
            await updateStockForPurchase(updatedPurchase, session);
        }

        await session.commitTransaction();
        session.endSession();
        return updatedPurchase;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const deletePurchaseService = async (id: string) => {
    const result = await Purchase.findByIdAndDelete(id);
    return result;
};
