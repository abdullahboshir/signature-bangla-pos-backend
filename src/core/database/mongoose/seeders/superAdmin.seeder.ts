import { Role } from "@app/modules/iam/role/role.model.ts";
import { User } from "@app/modules/iam/user/user.model.ts";
import { USER_ROLE, USER_STATUS } from "@app/modules/iam/user/user.constant.ts";
import mongoose from "mongoose";
import appConfig from "@shared/config/app.config.ts";

const SUPER_ADMIN_ID = "super_admin";

export const seedSuperAdmin = async () => {
  let session: mongoose.ClientSession | null = null;

  try {
    console.log("� Seeding SUPER ADMIN");

    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database not connected");
    }

    // Configuration validation
    const requiredConfig = ["super_admin_email", "super_admin_pass"];
    const missingConfig = requiredConfig.filter((key) => !appConfig[key]);

    if (missingConfig.length > 0) {
      throw new Error(`Missing required configuration: ${missingConfig.join(", ")}`);
    }

    if (!appConfig.super_admin_email || !appConfig.super_admin_pass) {
      throw new Error("Missing super admin credentials");
    }

    session = await mongoose.startSession();
    session.startTransaction();

    const role = await Role.findOne({ name: USER_ROLE.SUPER_ADMIN }).session(session);
    if (!role) {
      throw new Error("SUPER_ADMIN role not found. Run role seeder first.");
    }

    const existing = await User.findOne({
      $or: [
        { id: SUPER_ADMIN_ID },
        // Also check "super-admin" for backward compatibility if ID changed
        { id: "super-admin" },
        { email: appConfig.super_admin_email.toLowerCase() },
      ],
    }).session(session);

    if (existing) {
      existing.isSuperAdmin = true;
      existing.globalRoles = [role._id];
      // 🔐 IMPORTANT: We clear direct permissions because Super Admin gets full access via Role
      // This keeps the user document clean and avoids bloat.
      existing.directPermissions = [];

      // Ensure password is up to date with env
      existing.password = appConfig.super_admin_pass;

      await existing.save({ session });

      await session.commitTransaction();
      return { success: true, message: "Super admin synced" };
    }

    // Create new Super Admin
    await User.create(
      [
        {
          id: SUPER_ADMIN_ID,
          email: appConfig.super_admin_email.toLowerCase(),
          password: appConfig.super_admin_pass,
          name: { firstName: "Super", lastName: "Admin" },
          nameBangla: "সুপার অ্যাডমিন",
          descriptionBangla: "সম্পূর্ণ সিস্টেমে অ্যাক্সেস",
          phone: "01800000000",
          description: "Full system access with all permissions",
          isSuperAdmin: true,
          status: USER_STATUS.ACTIVE,
          globalRoles: [role._id],
          directPermissions: [],
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          createdBy: null,
          updatedBy: null,
          metadata: {
            seededAt: new Date(),
            seederVersion: "1.0",
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return { success: true, message: "Super admin created" };
  } catch (err: any) {
    if (session) await session.abortTransaction();
    throw err;
  } finally {
    if (session) session.endSession();
  }
};

export default seedSuperAdmin;
