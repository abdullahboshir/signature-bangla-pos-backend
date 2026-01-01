import { Permission } from "@app/modules/iam/permission/permission.model.ts";
import { Role } from "@app/modules/iam/role/role.model.ts";
import { USER_ROLE, USER_STATUS } from "@app/modules/iam/user/user.constant.ts";
import { User } from "@app/modules/iam/user/user.model.ts";
import appConfig from "@shared/config/app.config.ts";
import mongoose from "mongoose";

export const seedSuperAdmin = async () => {
  let session;

  try {
    console.log("🔧 Starting super admin seeding...");

    // 1. Database connection check
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    // 2. Configuration validationF
    if (!appConfig.super_admin_email || !appConfig.super_admin_pass) {
      throw new Error("Missing required configuration");
    }

    // 2. Configuration validation
    const requiredConfig = ["super_admin_email", "super_admin_pass"];
    const missingConfig = requiredConfig.filter((key) => !appConfig[key]);

    if (missingConfig.length > 0) {
      throw new Error(
        `Missing required configuration: ${missingConfig.join(", ")}`
      );
    }

    if (!isValidEmail(appConfig.super_admin_email)) {
      throw new Error("Invalid super admin email format");
    }

    if (appConfig.super_admin_pass.length < 8) {
      throw new Error(
        "Super admin password must be at least 8 characters long"
      );
    }

    // 3. Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 5. Validate dependencies (Moved up to ensure we can update existing super admin correctly)
    const [role, allPermissions] = await Promise.all([
      Role.findOne({ name: USER_ROLE.SUPER_ADMIN }).session(session),
      Permission.find({}).session(session),
    ]);

    if (!role) {
      await session.abortTransaction();
      console.log("❌ super_admin role not found");
      return {
        success: false,
        message: "super_admin role not found. Please run role seeder first.",
        requiresRoleSeeder: true,
      };
    }

    if (!allPermissions || allPermissions.length === 0) {
      await session.abortTransaction();
      console.log("❌ No permissions found");
      return {
        success: false,
        message: "No permissions found. Please run permission seeder first.",
        requiresPermissionSeeder: true,
      };
    }

    // 4. Check for existing super admin (multiple criteria)
    const existingSuperAdmin = await User.findOne({
      $or: [
        { id: "super_admin" },
        { email: appConfig.super_admin_email.toLowerCase() },
        { 'globalRoles': { $in: [role._id] } },
      ],
    }).session(session);

    if (existingSuperAdmin) {
      // Ensure password is synced with .env
      existingSuperAdmin.password = appConfig.super_admin_pass;
      existingSuperAdmin.isSuperAdmin = true;

      // Sync Roles and Permissions (Fixes Schema Mismatch and updates permissions)
      existingSuperAdmin.globalRoles = [role._id];

      // Explicitly set directPermissions to Object format to resolve schema mismatch (Array vs Object)
      existingSuperAdmin.directPermissions = {
        allow: allPermissions.map((p) => p._id),
        deny: []
      };

      await existingSuperAdmin.save({ session });

      await session.commitTransaction();
      console.log("✅ SUPER_ADMIN exists - Password, Roles & Permissions Synced");
      return {
        success: true,
        message: "SUPER_ADMIN synced successfully",
        exists: true,
      };
    }

    // 7. Create super admin
    const superAdminData = {
      id: "super-admin",
      email: appConfig.super_admin_email.toLowerCase(),
      phone: "01800000000",
      password: appConfig.super_admin_pass,
      name: { firstName: "Super", lastName: "Admin" },
      nameBangla: "সুপার অ্যাডমিন",
      description: "Full system access with all permissions",
      descriptionBangla: "সম্পূর্ণ সিস্টেমে অ্যাক্সেস",
      isActive: true,
      isSuperAdmin: true,
      status: USER_STATUS.ACTIVE,
      isEmailVerified: true,
      isPhoneVerified: true,
      globalRoles: [role._id],
      directPermissions: {
        allow: allPermissions.map((p) => p._id),
        deny: []
      },
      lastLogin: new Date(),
      createdBy: null,
      updatedBy: null,
      metadata: {
        seededAt: new Date(),
        seederVersion: "1.0",
      },
    };

    const superAdmin = await User.create([superAdminData], { session });

    if (!superAdmin) {
      await session.abortTransaction();
      throw new Error("Failed to create super admin");
    }

    // 8. Commit transaction
    await session.commitTransaction();

    return {
      success: true,
      message: "Super admin created successfully",
      data: {
        id: superAdmin[0] && superAdmin[0]._id,
        email: superAdmin[0] && superAdmin[0].email,
        name: superAdmin[0] && superAdmin[0].name,
        permissionsCount: allPermissions.length,
        createdAt: superAdmin[0] && superAdmin[0].createdAt,
      },
    };
  } catch (error: any) {
    // Rollback transaction if it was started
    if (session) {
      await session.abortTransaction();
    }

    console.error("❌ Error seeding super admin:", error);

    return {
      success: false,
      message: error.message || "Failed to seed super admin",
      error:
        process.env["NODE_ENV"] === "development" ? error.stack : undefined,
      code: getErrorCode(error),
    };
  } finally {
    // End session if it was created
    if (session) {
      session.endSession();
    }
  }
};

// Helper functions
function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}



function getErrorCode(error: any) {
  if (error.name === "ValidationError") return "VALIDATION_ERROR";
  if (error.name === "MongoError") return "DATABASE_ERROR";
  if (error.code === 11000) return "DUPLICATE_ERROR";
  return "UNKNOWN_ERROR";
}

// Export for use in application startup
export default seedSuperAdmin;
