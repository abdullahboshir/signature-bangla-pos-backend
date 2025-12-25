import { Product } from "@app/modules/catalog/product/product-core/product-core.model.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import mongoose, { type PipelineStage } from "mongoose";
import type { IStockReportFilters } from "./stock-report.interface.js";

const getStockValuation = async (filters: IStockReportFilters) => {
    const { businessUnit, outlet, category, brand, lowStockOnly } = filters;

    // 1. Base Match
    const matchStage: any = {
        isDeleted: false,
        status: 'active'
    };

    if (businessUnit) {
        const buId = await resolveBusinessUnitId(businessUnit);
        if (buId) matchStage.businessUnit = buId;
    }

    if (outlet && mongoose.Types.ObjectId.isValid(outlet)) {
        matchStage.outlet = new mongoose.Types.ObjectId(outlet);
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
        matchStage.primaryCategory = new mongoose.Types.ObjectId(category);
    }

    if (brand && mongoose.Types.ObjectId.isValid(brand)) {
        matchStage.brand = new mongoose.Types.ObjectId(brand);
    }

    if (lowStockOnly) {
        // Find products where stock <= alertQuantity
        matchStage.$expr = { $lte: ["$inventory.stock", "$inventory.alertQuantity"] };
    }

    // 2. Aggregation Pipeline
    const pipeline: PipelineStage[] = [
        { $match: matchStage },
        {
            $project: {
                name: 1,
                sku: 1,
                stock: "$inventory.stock",
                costPrice: "$pricing.costPrice",
                sellingPrice: "$pricing.sellingPrice",
                totalCostValue: { $multiply: ["$inventory.stock", "$pricing.costPrice"] },
                totalRetailValue: { $multiply: ["$inventory.stock", "$pricing.sellingPrice"] }
            }
        },
        { $sort: { totalCostValue: -1 } }
    ];

    const stockItems = await Product.aggregate(pipeline);

    // 3. Calculate Summary
    const summary = stockItems.reduce((acc: any, item: any) => {
        acc.totalStockCount += item.stock || 0;
        acc.totalCostValue += item.totalCostValue || 0;
        acc.totalRetailValue += item.totalRetailValue || 0;
        return acc;
    }, {
        totalStockCount: 0,
        totalCostValue: 0,
        totalRetailValue: 0,
        lowStockItems: lowStockOnly ? stockItems.length : 0 // If filter applied, all are low stock
    });

    // If not low stock filter, we might want to check low stock count separately efficiently?
    // For now simple reduce is fine unless generic filters apply.

    return {
        summary,
        items: stockItems
    };
};

export const StockReportService = {
    getStockValuation
};
