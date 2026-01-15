import { Stock } from "./stock.model.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.ts";
import AppError from "@shared/errors/app-error.ts";

export const getAllStockLevelsService = async (query: any) => {
    // 1. Build Query using QueryBuilder for standard filtering/search
    const stockQuery = new QueryBuilder(
        Stock.find().populate('product'),
        query
    )
        .search(['product.name', 'product.sku'])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await stockQuery.modelQuery;
    const meta = await stockQuery.countTotal();

    // 2. Optional: Add stats if needed via aggregation
    // For now, returning standard paginated result
    return {
        meta,
        data: result
    };
};

export const getProductStockLevelService = async (productId: string) => {
    const inventory = await Stock.findOne({ product: productId })
        .populate('product', 'name sku images')
        .populate('outletStock.outlet', 'name location');

    if (!inventory) {
        throw new AppError(404, 'Stock levels not found for this product');
    }

    return inventory;
};
