import { Permission } from "@app/modules/iam/permission/permission.model.ts";
import { Role } from "@app/modules/iam/role/role.model.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
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

    // 4. Check for existing super admin (multiple criteria)
    const existingSuperAdmin = await User.findOne({
      $or: [
        { id: "super_admin" },
        { email: appConfig.super_admin_email.toLowerCase() },
        { roles: { $in: [await getSuperAdminRoleId()] } },
      ],
    }).session(session);

    if (existingSuperAdmin) {
      await session.abortTransaction();
      console.log("✅ SUPER_ADMIN already exists");
      return {
        success: true,
        message: "SUPER_ADMIN already exists",
        exists: true,
      };
    }

    // 5. Validate dependencies
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
      isEmailVerified: true,
      isPhoneVerified: true,
      hierarchyLevel: 100,
      isDefault: false,
      isSystemRole: true,
      maxDataAccess: {
        products: -1, // -1 for unlimited access
        orders: -1,
        customers: -1,
        vendors: -1,
      },
      roles: [role._id],
      permissionGroups: [],
      directPermissions: allPermissions.map((p) => p._id),
      inheritedRoles: [],
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

async function getSuperAdminRoleId() {
  const role = await Role.findOne({ name: "SUPER_ADMIN" });
  return role ? role._id : null;
}

function getErrorCode(error: any) {
  if (error.name === "ValidationError") return "VALIDATION_ERROR";
  if (error.name === "MongoError") return "DATABASE_ERROR";
  if (error.code === 11000) return "DUPLICATE_ERROR";
  return "UNKNOWN_ERROR";
}

// Export for use in application startup
export default seedSuperAdmin;
