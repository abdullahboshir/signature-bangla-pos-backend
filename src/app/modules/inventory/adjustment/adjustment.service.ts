import { startSession } from 'mongoose';
import { InventoryAdjustment } from './adjustment.model.js';
import type { IInventoryAdjustment } from './adjustment.model.js';
import { ProductInventory } from '../../catalog/product/product-inventory/product-inventory.model.js';
import { addLedgerEntryService } from '../ledger/ledger.service.js';
import AppError from '../../../../shared/errors/app-error.js';

export const createAdjustmentService = async (payload: Partial<IInventoryAdjustment>, userId: string) => {
    const session = await startSession();
    session.startTransaction();
    try {
        const referenceNo = `ADJ-${new Date().getTime()}`; // Simple unique ref

        const adjustment = new InventoryAdjustment({
            ...payload,
            referenceNo,
            adjustedBy: userId,
            status: 'completed' // Immediate effect for now
        });

        // Process each item
        if (adjustment.items && adjustment.items.length > 0) {
            for (const item of adjustment.items) {
                const inventory = await ProductInventory.findOne({ product: item.product }).session(session);
                if (!inventory) {
                    throw new AppError(404, `Inventory not found for product ${item.product}`);
                }

                const qtyChange = item.type === 'increase' ? item.quantity : -item.quantity;

                // Update Inventory
                // We use the model's addStock method. If decrease, we pass negative? 
                // ProductInventory.addStock supports adding. For decreasing, we might need a separate method or pass negative.
                // Looking at ProductInventory model, stock is number.

                // Let's manually manipulate for precision control here
                if (adjustment.outlet) {
                    // Check outlet stock exists check is handled in addStock logic somewhat, but for decrease we need to be careful.
                    let outletEntry = inventory.outletStock?.find(os => os.outlet.toString() === adjustment.outlet!.toString());

                    if (item.type === 'increase') {
                        inventory.addStock(item.quantity, adjustment.outlet.toString());
                    } else {
                        // Decrease
                        if (!outletEntry || outletEntry.stock < item.quantity) {
                            throw new AppError(400, `Insufficient stock in outlet for product ${item.product}`);
                        }
                        outletEntry.stock -= item.quantity;
                        inventory.inventory.stock -= item.quantity; // Global sync
                    }
                } else {
                    // Global Adjustment
                    if (item.type === 'increase') {
                        inventory.inventory.stock += item.quantity;
                    } else {
                        if (inventory.inventory.stock < item.quantity) {
                            throw new AppError(400, `Insufficient global stock for product ${item.product}`);
                        }
                        inventory.inventory.stock -= item.quantity;
                    }
                }

                inventory.updateStockStatus();
                await inventory.save({ session });

                // Add to Ledger
                await addLedgerEntryService({
                    product: item.product,
                    outlet: adjustment.outlet as any,
                    type: 'adjustment',
                    quantity: qtyChange,
                    reference: referenceNo,
                    referenceType: 'InventoryAdjustment',
                    remarks: item.reason
                }, session);
            }
        }

        await adjustment.save({ session });
        await session.commitTransaction();
        session.endSession();
        return adjustment;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const getAdjustmentsService = async (query: Record<string, unknown>) => {
    return await InventoryAdjustment.find(query)
        .populate('outlet', 'name')
        .populate('items.product', 'name sku')
        .populate('adjustedBy', 'name')
        .sort({ createdAt: -1 });
};
