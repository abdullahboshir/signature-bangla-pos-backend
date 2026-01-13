import bcrypt from "bcrypt";
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

    try {
        // 1. Get the Role ID
        const role = await Role.findOne({ name: USER_ROLE.SUPER_ADMIN }).session(session || null);
        if (!role) {
            throw new Error("CRITICAL: SUPER_ADMIN role not found. Run role seeder first.");
        }

        // 2. Hash Password Manually (findOneAndUpdate bypasses pre-save hooks)
        const saltRounds = parseInt(appConfig.bcrypt_salt_rounds) || 12;
        const hashedPassword = await bcrypt.hash(appConfig.super_admin_pass, saltRounds);

        // 3. Atomic Upsert with Context Bypass
        const query = User.findOneAndUpdate(
            { id: SUPER_ADMIN_ID },
            {
                $set: {
                    // Identity
                    email: appConfig.super_admin_email.toLowerCase(),
                    password: hashedPassword, // Explicitly hashed
                    name: { firstName: "Super", lastName: "Admin" },
                    nameBangla: "সুপার অ্যাডমিন",

                    // Roles & Access
                    isSuperAdmin: true,
                    status: USER_STATUS.ACTIVE,
                    globalRoles: [role._id],
                    directPermissions: [],

                    // Metadata
                    phone: "01800000000",
                    description: "Full system access with all permissions",
                    descriptionBangla: "সম্পূর্ণ সিস্টেমে অ্যাক্সেস",

                    // Verification
                    isEmailVerified: true,
                    isPhoneVerified: true,
                    isActive: true, // Legacy flag

                    metadata: {
                        seededAt: new Date(),
                        seederVersion: "2.1",
                    },

                    // Audit
                    updatedBy: null
                },
                $setOnInsert: {
                    createdBy: null
                }
            },
            {
                upsert: true,
                new: true,
                session: session || null, // Ensure explicit null if undefined
                setDefaultsOnInsert: true,
                runValidators: true
            }
        );

        // CRITICAL: Bypass the context-scope plugin to ensure we find the existing Global Super Admin
        // without company filtering restrictions.
        (query as any)._bypassContext = true;

        await query.exec();

        console.log("✅ Super Admin user synced (Atomic + Context Bypass).");

    } catch (error: any) {
        console.error("❌ Failed to seed Super Admin:", error.message);
        throw error;
    }
}
