import { Order } from "@app/modules/commerce/index.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import mongoose, { type PipelineStage } from "mongoose";
import type { ISalesReportFilters } from "./sales-report.interface.js";

const getSalesStats = async (filters: ISalesReportFilters) => {
    const { startDate, endDate, businessUnit, outlet } = filters;

    // 1. Base Match Stage
    const matchStage: any = {
        // Only count valid orders
        status: { $nin: ["cancelled", "returned"] },
        paymentStatus: { $in: ["paid", "partial"] }
    };

    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) matchStage.createdAt.$gte = new Date(startDate);
        if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    if (businessUnit) {
        // Business Unit is critical for multi-tenancy
        // We might accept ID or Slug
        const buId = await resolveBusinessUnitId(businessUnit);
        if (buId) matchStage.businessUnit = buId;
    }

    if (outlet) {
        if (mongoose.Types.ObjectId.isValid(outlet)) {
            matchStage.outlet = new mongoose.Types.ObjectId(outlet);
        }
    }

    // 2. Daily Sales Aggregation
    const dailySalesPipeline: PipelineStage[] = [
        { $match: matchStage },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                totalSales: { $sum: "$totalAmount" },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } } // Sort by date ascending
    ];

    // 3. Top Products Aggregation
    const topProductsPipeline: PipelineStage[] = [
        { $match: matchStage },
        { $unwind: "$orderItems" }, // Deconstruct order items
        {
            $group: {
                _id: "$orderItems.product", // Group by Product ID
                name: { $first: "$orderItems.name" }, // Take first name (assuming static or snapshot)
                sku: { $first: "$orderItems.sku" },
                totalQuantity: { $sum: "$orderItems.quantity" },
                totalRevenue: { $sum: "$orderItems.totalPrice" }
            }
        },
        { $sort: { totalQuantity: -1 } }, // Sort by quantity sold desc
        { $limit: 10 } // Top 10
    ];

    const [dailySales, topProducts] = await Promise.all([
        Order.aggregate(dailySalesPipeline),
        Order.aggregate(topProductsPipeline)
    ]);

    return {
        dailySales,
        topProducts
    };
};

export const SalesReportService = {
    getSalesStats
};
