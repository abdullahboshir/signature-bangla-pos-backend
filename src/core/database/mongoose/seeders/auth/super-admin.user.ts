import { Role } from "@app/modules/iam/role/role.model.ts";
import { User } from "@app/modules/iam/user/user.model.ts";
import { USER_ROLE, USER_STATUS } from "@app/modules/iam/user/user.constant.ts";
import mongoose from "mongoose";
import appConfig from "@shared/config/app.config.ts";

const SUPER_ADMIN_ID = "super_admin";

/**
 * Ensures the fundamental Super Admin user exists and has full system-wide access.
 * ⚠️ This seeder is IDEMPOTENT and relies on the SUPER_ADMIN role being created first.
 */
export async function seedSuperAdminUser(session?: mongoose.ClientSession) {
    if (mongoose.connection.readyState !== 1) {
        throw new Error("Database not connected");
    }

    // Configuration validation
    const requiredConfig = ["super_admin_email", "super_admin_pass"];
    const missingConfig = requiredConfig.filter((key) => !(appConfig as any)[key]);

    if (missingConfig.length > 0) {
        throw new Error(`Missing required configuration: ${missingConfig.join(", ")}`);
    }

    if (!appConfig.super_admin_email || !appConfig.super_admin_pass) {
        throw new Error("Missing super admin credentials in environment.");
    }

    // 1. Get the Role ID
    const role = await Role.findOne({ name: USER_ROLE.SUPER_ADMIN }).session(session || null);
    if (!role) {
        throw new Error("CRITICAL: SUPER_ADMIN role not found. Run role seeder first.");
    }

    // 2. Check for existing user
    const existing = await User.findOne({
        $or: [
            { id: SUPER_ADMIN_ID },
            { id: "super-admin" }, // Compatibility
            { email: appConfig.super_admin_email.toLowerCase() },
        ],
    }).session(session || null);

    if (existing) {
        existing.isSuperAdmin = true;
        existing.globalRoles = [role._id] as any;
        existing.directPermissions = []; // Keep document clean
        existing.password = appConfig.super_admin_pass; // Sync password from env

        await existing.save({ session: session || null });
        console.log("✅ Super Admin user synced successfully.");
        return;
    }

    // 3. Create fresh Super Admin
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
                    seederVersion: "2.0",
                },
            },
        ],
        session ? { session } : {}
    );

    console.log("🚀 Super Admin user created successfully.");
}
