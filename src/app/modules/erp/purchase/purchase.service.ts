import { startSession, isValidObjectId, Types } from 'mongoose';
import AppError from '../../../../shared/errors/app-error.js';
import { Purchase } from './purchase.model.js';
import type { IPurchase } from './purchase.interface.js';
import { Product } from '../../commerce/catalog/product/product-core/product-core.model.js';
import { addLedgerEntryService } from "../inventory/ledger/ledger.service.js";

// Helper to update stock
// Helper to update stock
const updateStockForPurchase = async (purchase: any, session: any, action: 'add' | 'remove' = 'add') => {
    if (!purchase.outlet) {
        throw new AppError(400, "Purchase must have an outlet to update stock");
    }
    const outletId = (purchase.outlet && typeof purchase.outlet === 'object' && '_id' in purchase.outlet)
        ? (purchase.outlet as any)._id.toString()
        : purchase.outlet.toString();

    for (const item of purchase.items) {
        const product = await Product.findById(item.product).populate('inventory').session(session);
        if (product && product.inventory) {
            const inventoryDoc = product.inventory as any;

            if (action === 'add') {
                if (typeof inventoryDoc.addStock === 'function') {
                    inventoryDoc.addStock(item.quantity, outletId);
                } else {
                    console.error(`addStock method missing on inventory for product ${product._id}`);
                }
            } else {
                if (typeof inventoryDoc.removeStock === 'function') {
                    inventoryDoc.removeStock(item.quantity, outletId);
                } else {
                    console.error(`removeStock method missing on inventory for product ${product._id}`);
                }
            }

            await inventoryDoc.save({ session });

            // Add to Ledger
            await addLedgerEntryService({
                product: item.product,
                outlet: new Types.ObjectId(outletId),
                type: 'purchase',
                quantity: action === 'add' ? item.quantity : -item.quantity,
                reference: purchase.referenceNo || purchase._id.toString(),
                referenceType: 'Purchase',
                remarks: action === 'add'
                    ? `Received via Purchase ${purchase.referenceNo || ''}`
                    : `Stock Reversal (Purchase Status Changed) - ${purchase.referenceNo || ''}`
            }, session);
        }
    }
};

export const createPurchaseService = async (data: IPurchase, user?: any) => {
    const session = await startSession();
    session.startTransaction();
    try {
        console.log('Purchase Data:', data);
        if (!data.id) {
            data.id = `PUR-${Date.now()}`;
        }

        if (user && user._id) {
            data.createdBy = user._id;
        }

        const result = await Purchase.create([data], { session });
        const createdPurchase = result[0];

        if (!createdPurchase) {
            throw new AppError(400, "Purchase not created");
        }

        if (createdPurchase.status === 'received') {
            await updateStockForPurchase(createdPurchase, session, 'add');
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

    const result = await Purchase.find(whereConditions)
        .populate('supplier', 'name email')
        .populate('businessUnit', 'name')
        .populate({
            path: 'items.product',
            select: 'name unit',
            populate: {
                path: 'unit',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 });

    return result;
};

export const getPurchaseByIdService = async (id: string) => {
    let query;
    if (isValidObjectId(id)) {
        query = Purchase.findById(id);
    } else {
        query = Purchase.findOne({ id });
    }

    const result = await query
        .populate('supplier')
        .populate('items.product', 'name sku');

    if (!result) {
        throw new AppError(404, "Purchase not found");
    }
    return result;
};

export const updatePurchaseService = async (id: string, payload: Partial<IPurchase>) => {
    const session = await startSession();
    session.startTransaction();
    try {
        let query = isValidObjectId(id) ? { _id: id } : { id: id };

        const existingPurchase = await Purchase.findOne(query).session(session);
        if (!existingPurchase) throw new AppError(404, "Purchase not found");

        const previousStatus = existingPurchase.status;
        const realId = existingPurchase._id;

        // Update the purchase
        const updatedPurchase = await Purchase.findByIdAndUpdate(realId, payload, {
            new: true,
            runValidators: true,
            session
        });

        if (!updatedPurchase) throw new AppError(404, "Purchase not found after update");

        // If status changed to 'received', add stock
        if (previousStatus !== 'received' && updatedPurchase.status === 'received') {
            await updateStockForPurchase(updatedPurchase, session, 'add');
        }
        // If status changed FROM 'received' to something else (e.g. pending/ordered), remove stock
        else if (previousStatus === 'received' && updatedPurchase.status !== 'received') {
            await updateStockForPurchase(updatedPurchase, session, 'remove');
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
    let query = isValidObjectId(id) ? { _id: id } : { id: id };
    const result = await Purchase.findOneAndDelete(query);
    return result;
};
