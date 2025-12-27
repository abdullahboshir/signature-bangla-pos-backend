import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import status from "http-status";
import { User } from "./user.model.ts";
import mongoose from "mongoose";
import { createCustomerService, createStaffService } from "./user.service.ts";
import { sendImageToCloudinary } from "@core/utils/file-upload.ts";
import { USER_ROLE } from "./user.constant.ts";
import { resolveBusinessUnitIds } from "@core/utils/mutation-helper.ts";

export const createUserController = catchAsync(async (req, res) => {
    const userData = req.body;
    const file = req.file;

    console.log("=== CREATE USER CONTROLLER ===");
    console.log("Role:", userData.role);

    // Check Role Name (Frontend sends role ID, but we might need to fetch name if logic depends on "CUSTOMER" string)
    // However, usually specific roles have specific flows.
    // For now, let's try to detect intent.

    // 1. If it's a Customer (Role Check)
    // We need to fetch the role name first to be sure, OR assume frontend sends 'role' as ID.
    // Let's assume we need to check the role object.

    let roleId = userData.role;
    // Fallback: Check if role is inside permissions array (Frontend sends this structure in Add User Page)
    if (!roleId && userData.permissions && Array.isArray(userData.permissions) && userData.permissions.length > 0) {
        roleId = userData.permissions[0].role;
    }
    // Fallback 2: Check if role is inside roles array (Frontend sends this in Staff Modal)
    if (!roleId && userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
        // user.roles can be array of IDs or Objects (if populated, but usually IDs in create payload)
        const firstRole = userData.roles[0];
        roleId = typeof firstRole === 'string' ? firstRole : firstRole._id || firstRole.id;
    }

    let roleName = "";
    const Role = mongoose.model('Role');
    if (roleId) {
        const roleDoc = await Role.findById(roleId);
        if (roleDoc) roleName = roleDoc.name.toUpperCase();
    }

    let result;

    if (roleName === 'CUSTOMER') {
        console.log(">> Creating Customer Profile...");
        // Map userData to ICustomer
        const customerPayload = {
            ...userData,
            name: {
                firstName: userData.firstName,
                lastName: userData.lastName
            },
            // Mapping businessUnits? Customers usually don't have BU assignments in the same way, or just 'customer'
        };
        result = await createCustomerService(customerPayload, userData.password, file);

    } else if (
        [USER_ROLE.SUPER_ADMIN, USER_ROLE.GUEST, USER_ROLE.VENDOR].map(r => r.toUpperCase()).includes(roleName)
    ) {
        console.log(">> Creating Generic User (Super Admin, Guest, or Vendor)...");

        // Generate unique user ID if not provided
        if (!userData.id) {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2, 7);
            userData.id = `USER_${timestamp}_${random}`.toUpperCase();
        }

        // Apply Name Schema structure if flattened
        if (!userData.name && userData.firstName) {
            userData.name = {
                firstName: userData.firstName,
                lastName: userData.lastName
            };
        }

        // Resolve businessUnits using helper
        if (userData.businessUnits && Array.isArray(userData.businessUnits)) {
            userData.businessUnits = await resolveBusinessUnitIds(userData.businessUnits);
        }

        // Handle Image if generic user
        if (file) {
            const { secure_url } = (await sendImageToCloudinary(
                `USER-${userData.id}`,
                file.path
            )) as any;
            userData.avatar = secure_url;
        }

        // Create user
        result = await User.create(userData);

    } else {
        // DEFAULT: All other roles (Manager, Admin, Cashier, Sales Associate, and ANY DYNAMIC ROLE)
        // are treated as STAFF and get a Staff Profile.
        console.log(`>> Creating Staff Profile for Role: ${roleName}`);

        // Map userData to IStaff
        const staffPayload = {
            ...userData,
            firstName: userData.firstName,
            lastName: userData.lastName,
            businessUnit: userData.businessUnit, // ID
            // Ensure designation is set (fallback to Role Name if missing)
            designation: userData.designation || roleName,
        };

        // If outlet is passed as single string 'outlet'
        if (userData.outlet) {
            (staffPayload as any).assignedOutlets = [userData.outlet];
        }

        result = await createStaffService(staffPayload, userData.password, file);
    }

    ApiResponse.success(res, {
        success: true,
        statusCode: status.CREATED,
        message: "User and Profile created successfully",
        data: result,
    });
});
