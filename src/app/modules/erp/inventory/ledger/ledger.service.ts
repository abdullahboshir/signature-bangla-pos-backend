import type { IStockLedger } from './ledger.model.js';
import { StockLedger } from './ledger.model.js';
import { ProductInventory } from "../../../commerce/catalog/product/features/product-inventory/product-inventory.model.js";

export const addLedgerEntryService = async (
    payload: Partial<IStockLedger>,
    session?: any
) => {
    // If no session provided, we might want to start one, but usually this is called within a transaction
    // So we assume session is passed if consistency is critical.

    // Calculate balance after if not provided (Optional, might be expensive to query strictly)
    // For now, we trust the caller or just log the delta. 
    // Ideally, we fetch current stock + delta = balanceAfter.

    let balanceAfter = 0;

    // We try to fetch current stock to calc balanceAfter if possible
    if (payload.product) {
        const inventory = await ProductInventory.findOne({ product: payload.product }).session(session);
        if (inventory) {
            // Logic to find specific stock (global or outlet)
            if (payload.outlet) {
                const outletStock = inventory.outletStock?.find((os: any) => os.outlet.toString() === payload.outlet!.toString());
                balanceAfter = (outletStock?.stock || 0); // Note: The inventory might have ALREADY been updated by the caller.
                // If the inventory IS ALREADY updated, then balanceAfter IS the current stock.
            } else {
                balanceAfter = inventory.inventory.stock;
            }
        }
    }

    const entry = new StockLedger({
        ...payload,
        balanceAfter // This might be approximate if concurrency is high, but good for reference
    });

    await entry.save({ session });
    return entry;
};

export const getLedgerHistoryService = async (query: Record<string, unknown>) => {
    const { product, outlet, startDate, endDate } = query;
    const filter: any = {};

    if (product) filter.product = product;
    if (outlet) filter.outlet = outlet;
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) filter.date.$gte = new Date(startDate as string);
        if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const history = await StockLedger.find(filter)
        .populate('product', 'name sku')
        .populate('outlet', 'name')
        .sort({ date: -1 })
        .limit(100); // Limit for performance

    return history;
};
