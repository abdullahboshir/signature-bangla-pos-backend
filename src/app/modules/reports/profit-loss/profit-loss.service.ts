import { Order } from "@app/modules/sales/order/order.model.js";
import { Expense } from "@app/modules/cash/expense/expense.model.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import mongoose, { type PipelineStage } from "mongoose";
import type { IProfitLossFilters, IProfitLossStatement } from "./profit-loss.interface.js";

const getProfitLossStatement = async (filters: IProfitLossFilters): Promise<IProfitLossStatement> => {
    const { startDate, endDate, businessUnit, outlet } = filters;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Base Match for Orders (Revenue & COGS)
    const orderMatch: any = {
        status: { $nin: ["cancelled", "returned"] },
        createdAt: { $gte: start, $lte: end }
    };

    // 2. Base Match for Expenses
    const expenseMatch: any = {
        status: "approved", // Assuming only approved expenses count
        date: { $gte: start, $lte: end }
    };

    if (businessUnit) {
        const buId = await resolveBusinessUnitId(businessUnit);
        if (buId) {
            orderMatch.businessUnit = buId;
            expenseMatch.businessUnit = buId;
        }
    }

    if (outlet && mongoose.Types.ObjectId.isValid(outlet)) {
        orderMatch.outlet = new mongoose.Types.ObjectId(outlet);
        expenseMatch.outlet = new mongoose.Types.ObjectId(outlet);
    }

    // 3. Calculate Revenue & COGS from Orders
    const salesPipeline: PipelineStage[] = [
        { $match: orderMatch },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" }, // Note: We should sum (qty * price) or order.totalAmount? 
                // Let's use orderItems sum for precision if we uncrossed
                totalCOGS: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.costPrice"] } }
            }
        }
    ];

    // Note: totalAmount in Order model usually includes tax/shipping. 
    // Gross Profit analysis typically uses Net Sales (Revenue - Returns - Discounts).
    // For simplicity now: Revenue = sum(order.totalAmount).
    // But for COGS we MUST look at items.

    // Re-refining Sales Pipeline to match document structure
    const revenuePipeline: PipelineStage[] = [
        { $match: orderMatch },
        {
            $group: {
                _id: null,
                revenue: { $sum: "$totalAmount" }
            }
        }
    ];

    const cogsPipeline: PipelineStage[] = [
        { $match: orderMatch },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: null,
                cogs: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.costPrice"] } }
            }
        }
    ];

    // 4. Calculate Expenses
    const expensePipeline: PipelineStage[] = [
        { $match: expenseMatch },
        {
            $group: {
                _id: null,
                totalExpenses: { $sum: "$amount" }
            }
        }
    ];

    const expenseBreakdownPipeline: PipelineStage[] = [
        { $match: expenseMatch },
        {
            $lookup: {
                from: "expensecategories",
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        { $unwind: "$categoryDetails" },
        {
            $group: {
                _id: "$categoryDetails.name",
                amount: { $sum: "$amount" }
            }
        },
        {
            $project: {
                category: "$_id",
                amount: 1,
                _id: 0
            }
        }
    ];

    const [revenueRes, cogsRes, expenseRes, expenseBreakdown] = await Promise.all([
        Order.aggregate(revenuePipeline),
        Order.aggregate(cogsPipeline),
        Expense.aggregate(expensePipeline),
        Expense.aggregate(expenseBreakdownPipeline)
    ]);

    const revenue = revenueRes[0]?.revenue || 0;
    const cogs = cogsRes[0]?.cogs || 0;
    const expenses = expenseRes[0]?.totalExpenses || 0;

    // Revenue might include tax. Gross Profit = Revenue - COGS.
    // Ideally Net Sales = Revenue - Tax. But let's keep it simple for MVP.
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - expenses;

    return {
        revenue,
        cogs,
        grossProfit,
        expenses,
        netProfit,
        expenseBreakdown
    };
};

export const ProfitLossService = {
    getProfitLossStatement
};
