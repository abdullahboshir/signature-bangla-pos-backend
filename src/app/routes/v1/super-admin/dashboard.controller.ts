import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import status from "http-status";
import mongoose from "mongoose";

// Get aggregated dashboard stats for super admin
export const getDashboardStatsController = catchAsync(async (req, res) => {
    const BusinessUnit = mongoose.model("BusinessUnit");
    const User = mongoose.model("User");

    // Get total business units count
    const totalBusinessUnits = await BusinessUnit.countDocuments({ isDeleted: false });

    // Get active business units count
    const activeBusinessUnits = await BusinessUnit.countDocuments({
        isDeleted: false,
        isActive: true
    });

    // Get total users count
    const totalUsers = await User.countDocuments({ isDeleted: false });

    // Get active users count
    const activeUsers = await User.countDocuments({
        isDeleted: false,
        status: "active"
    });

    // TODO: Add revenue calculation when Order/Sales models are available
    // const totalRevenue = await Order.aggregate([...]);

    const stats = {
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
            total: 0, // Placeholder - implement when sales module ready
            currency: "BDT"
        },
        sales: {
            total: 0, // Placeholder
            today: 0
        }
    };

    ApiResponse.success(res, {
        success: true,
        statusCode: status.OK,
        message: "Dashboard stats retrieved successfully",
        data: stats,
    });
});
