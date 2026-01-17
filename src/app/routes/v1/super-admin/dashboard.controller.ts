import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import status from "http-status";
import mongoose from "mongoose";

// Get aggregated dashboard stats for super admin or company owner
export const getDashboardStatsController = catchAsync(async (req, res) => {
    const BusinessUnit = mongoose.model("BusinessUnit");
    const User = mongoose.model("User");
    const UserBusinessAccess = mongoose.model("UserBusinessAccess");
    const Order = mongoose.model("Order");
    const Purchase = mongoose.model("Purchase");
    const Expense = mongoose.model("Expense");
    const Organization = mongoose.model("Organization");

    const user = req.user as any;
    const isSuperAdmin = user?.['roleName']?.includes("super-admin");
    const companyIds = user?.['companies'] || [];

    // Define filters based on role
    const buFilter: any = { isDeleted: false };
    const userFilter: any = { isDeleted: false };
    const commerceFilter: any = {};
    const companyFilter: any = {};

    if (!isSuperAdmin) {
        const objectCompanyIds = companyIds.map((id: string) => new mongoose.Types.ObjectId(id));
        buFilter.company = { $in: objectCompanyIds };
        commerceFilter.company = { $in: objectCompanyIds };
        companyFilter._id = { $in: objectCompanyIds };

        const uniqueUserIds = await UserBusinessAccess.distinct("user", {
            company: { $in: objectCompanyIds },
            status: "ACTIVE"
        });
        userFilter._id = { $in: uniqueUserIds };
    }

    // 1. Counts
    const totalCompanies = await Organization.countDocuments(companyFilter);
    const activeCompanies = await Organization.countDocuments({ ...companyFilter, isActive: true });
    
    const totalBusinessUnits = await BusinessUnit.countDocuments(buFilter);
    const activeBusinessUnits = await BusinessUnit.countDocuments({
        ...buFilter,
        status: "published"
    });
    const totalUsers = await User.countDocuments(userFilter);
    const activeUsers = await User.countDocuments({
        ...userFilter,
        status: "active"
    });

    // 2. Financial Aggregation (Platform-wide)
    // Note: We use .aggregate() which might be intercepted by contextScopePlugin.
    // If we are Super Admin, we want global view. 
    // The plugin unshifts a $match to the pipeline based on ContextService.getContext().
    // Since this is a global dashboard, we want it to reflect total platform wealth if Super Admin.

    const salesAgg = await (Order as any).aggregate([
        { $match: commerceFilter },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
                today: {
                    $sum: {
                        $cond: [
                            { $gte: ["$createdAt", new Date(new Date().setHours(0, 0, 0, 0))] },
                            "$totalAmount",
                            0
                        ]
                    }
                }
            }
        }
    ]);

    const purchaseAgg = await (Purchase as any).aggregate([
        { $match: commerceFilter },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
    ]);

    const expenseAgg = await (Expense as any).aggregate([
        { $match: commerceFilter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const stats = {
        companies: {
            total: totalCompanies,
            active: activeCompanies,
            inactive: totalCompanies - activeCompanies
        },
        businessUnits: {
            total: totalBusinessUnits,
            active: activeBusinessUnits,
            inactive: totalBusinessUnits - activeBusinessUnits
        },
        users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers
        },
        revenue: {
            total: salesAgg[0]?.total || 0,
            currency: "BDT"
        },
        sales: {
            total: salesAgg[0]?.total || 0,
            today: salesAgg[0]?.today || 0
        },
        // Aggregated for platform overview
        totalSales: salesAgg[0]?.total || 0,
        totalPurchase: purchaseAgg[0]?.total || 0,
        totalExpense: expenseAgg[0]?.total || 0,
        activeCompanies: activeCompanies, // Legacy field support if needed
        activeUnits: activeBusinessUnits, // Legacy field support if needed
        totalUsers: totalUsers // Legacy field support if needed
    };

    ApiResponse.success(res, stats, "Dashboard stats retrieved successfully", status.OK);
});
