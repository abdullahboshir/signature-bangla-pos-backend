import { Stock } from "./stock/stock.model.ts";
import type { IInventoryServiceContract } from "@app/core/contracts/module.contracts.ts";

/**
 * ERP Inventory Adapter
 * Official gateway for other modules (POS, Commerce) to interact with Inventory.
 */
export class ERPInventoryAdapter implements IInventoryServiceContract {
    
    async checkAvailability(productId: string, outletId: string, quantity: number): Promise<boolean> {
        const stock = await Stock.findOne({ product: productId }).populate('inventory');
        if (!stock) return false;
        
        return stock.canFulfillOrder(quantity, outletId);
    }

    async reserveStock(productId: string, outletId: string, quantity: number, session?: any): Promise<boolean> {
        const stock = await Stock.findOne({ product: productId }).session(session);
        if (!stock) return false;

        const success = stock.reserveStock(quantity, outletId);
        if (success) {
            await stock.save({ session });
        }
        return success;
    }

    async releaseStock(productId: string, outletId: string, quantity: number, session?: any): Promise<void> {
        const stock = await Stock.findOne({ product: productId }).session(session);
        if (stock) {
            stock.releaseStock(quantity, outletId);
            await stock.save({ session });
        }
    }

    async updateStock(
        productId: string, 
        outletId: string, 
        quantity: number, 
        operation: 'increase' | 'decrease' | 'set', 
        session?: any
    ): Promise<void> {
        const stock = await Stock.findOne({ product: productId }).session(session);
        if (!stock) return;

        if (operation === 'increase') {
            stock.addStock(quantity, outletId);
        } else if (operation === 'decrease') {
            stock.removeStock(quantity, outletId);
        } else if (operation === 'set') {
            // Logic for 'set' might need specific implementation in model
            // For now, let's assume we update global and outlet
            stock.inventory.stock = quantity;
            const outletData = stock.outletStock?.find(os => os.outlet.toString() === outletId);
            if (outletData) {
                outletData.stock = quantity;
            }
        }

        await stock.save({ session });
    }
}

export const inventoryAdapter = new ERPInventoryAdapter();
