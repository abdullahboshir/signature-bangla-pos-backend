import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import status from "http-status";
import mongoose from "mongoose";

// Get aggregated dashboard stats for super admin or company owner
export const getDashboardStatsController = catchAsync(async (req, res) => {
    const BusinessUnit = mongoose.model("BusinessUnit");
    const User = mongoose.model("User");
    const UserBusinessAccess = mongoose.model("UserBusinessAccess");

    const user = req.user as any;
    const isSuperAdmin = user?.['roleName']?.includes("super-admin");
    const companyIds = user?.['companies'] || [];

    // Define filters based on role
    const buFilter: any = { isDeleted: false };
    const userFilter: any = { isDeleted: false };

    if (!isSuperAdmin) {
        buFilter.company = { $in: companyIds.map((id: string) => new mongoose.Types.ObjectId(id)) };

        // For users, we filter those who have business access to the owner's companies
        const uniqueUserIds = await UserBusinessAccess.distinct("user", {
            company: { $in: companyIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
            status: "ACTIVE"
        });
        userFilter._id = { $in: uniqueUserIds };
    }

    // Get total business units count
    const totalBusinessUnits = await BusinessUnit.countDocuments(buFilter);

    // Get active business units count
    const activeBusinessUnits = await BusinessUnit.countDocuments({
        ...buFilter,
        status: "published",
        visibility: "public"
    });

    // Get total users count
    const totalUsers = await User.countDocuments(userFilter);

    // Get active users count
    const activeUsers = await User.countDocuments({
        ...userFilter,
        status: "active"
    });

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
            total: 0, // Placeholder
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
