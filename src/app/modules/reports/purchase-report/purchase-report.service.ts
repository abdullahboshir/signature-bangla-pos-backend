import { Purchase } from "@app/modules/purchase/purchase.model.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import mongoose, { type PipelineStage } from "mongoose";
import type { IPurchaseReportFilters } from "./purchase-report.interface.js";

const getPurchaseStats = async (filters: IPurchaseReportFilters) => {
    const { startDate, endDate, businessUnit, outlet, supplier, groupBy } = filters;

    // 1. Base Match Stage
    const matchStage: any = {
        status: { $in: ["received", "ordered"] } // Count confirmed purchases
    };

    if (startDate || endDate) {
        matchStage.purchaseDate = {};
        if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
        if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
    }

    if (businessUnit) {
        const buId = await resolveBusinessUnitId(businessUnit);
        if (buId) matchStage.businessUnit = buId;
    }

    if (outlet && mongoose.Types.ObjectId.isValid(outlet)) {
        matchStage.outlet = new mongoose.Types.ObjectId(outlet);
    }

    if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
        matchStage.supplier = new mongoose.Types.ObjectId(supplier);
    }

    // 2. Define Grouping Logic
    let groupId: any = {};

    if (groupBy === 'supplier') {
        groupId = "$supplier"; // Group by Supplier ID
    } else if (groupBy === 'month') {
        groupId = { $dateToString: { format: "%Y-%m", date: "$purchaseDate" } };
    } else {
        // Default to daily
        groupId = { $dateToString: { format: "%Y-%m-%d", date: "$purchaseDate" } };
    }

    // 3. Aggregation Pipeline
    const pipeline: PipelineStage[] = [
        { $match: matchStage },
        {
            $group: {
                _id: groupId,
                totalPurchases: { $sum: 1 },
                totalAmount: { $sum: "$grandTotal" },
                totalPaid: { $sum: "$paidAmount" },
                totalDue: { $sum: "$dueAmount" }
            }
        },
        { $sort: { totalAmount: -1 } } // Sort by amount desc
    ];

    // If grouping by supplier, lookup supplier details
    if (groupBy === 'supplier') {
        pipeline.push(
            {
                $lookup: {
                    from: "suppliers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "supplierDetails"
                }
            },
            { $unwind: "$supplierDetails" },
            {
                $project: {
                    supplierName: "$supplierDetails.name",
                    totalPurchases: 1,
                    totalAmount: 1,
                    totalPaid: 1,
                    totalDue: 1
                }
            }
        );
    }

    const result = await Purchase.aggregate(pipeline);

    return result;
};

export const PurchaseReportService = {
    getPurchaseStats
};
