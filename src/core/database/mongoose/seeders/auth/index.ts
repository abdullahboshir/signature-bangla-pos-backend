import { Role } from "@app/modules/iam/role/role.model.ts";
import mongoose from "mongoose";
import { SYSTEM_USER_ID, DEFAULT_LIMITS } from "./data/constants.ts";
import { syncPermissions, syncResourceGroups, auditResourceGroups } from "./group-manager.ts";
import { getPlatformRoleConfigs } from "./platform.seeder.ts";
import { getOrganizationRoleConfigs } from "./organization.seeder.ts";
import { getBusinessRoleConfigs } from "./business.seeder.ts";
import { getOutletRoleConfigs } from "./outlet.seeder.ts";
import { seedSuperAdminUser } from "./super-admin.user.ts";

/**
 * 🛡️ Main Authorization Seeder Orchestrator (Hybrid Split)
 * ⚠️ This seeder is IDEMPOTENT. Safe to run multiple times in production.
 * It uses upsert/sync logic to ensure data consistency without duplication.
 */
export async function runRolePermissionSeeder({ clean = false, session }: { clean?: boolean, session?: mongoose.ClientSession } = {}) {
    console.log("--- 🏗️ Modular Authorization Seeder Started ---");

    if (mongoose.connection.readyState !== 1) {
        throw new Error("Mongoose is not connected.");
    }

    // 0. Clean (Optional - WARNING: Destructive)
    if (clean) {
        console.log("🧹 Cleaning existing authorization data...");
        // Use empty filter {} to delete all documents, and pass session as options
        await mongoose.connection.collection("permissions").deleteMany({}, session ? { session } : {});
        await mongoose.connection.collection("permissiongroups").deleteMany({}, session ? { session } : {});
        await mongoose.connection.collection("roles").deleteMany({}, session ? { session } : {});
    }

    // 1. Sync Base Foundations (Permissions & Technical Groups)
    console.log("🛠️  Step 1: Syncing Permissions & Resource Groups...");
    await syncPermissions(session || undefined);
    const resourceGroupsMap = await syncResourceGroups(session || undefined);

    // 2. Audit Structural Integrity
    auditResourceGroups(resourceGroupsMap);

    // 3. Prepare Role Configurations (Ordered by Hierarchy)
    const get = (r: string) => resourceGroupsMap[r] || null;
    const fullGroupId = resourceGroupsMap['FULL_ACCESS']!;

    const roleConfigs = [
        ...getPlatformRoleConfigs(get, fullGroupId),
        ...getOrganizationRoleConfigs(get),
        ...getBusinessRoleConfigs(get),
        ...getOutletRoleConfigs(get),
    ];

    // 4. Atomic Bulk Role Injection
    console.log(`📡 Step 2: Syncing ${roleConfigs.length} Roles...`);
    try {
        const bulkOps = roleConfigs.map((cfg) => ({
            updateOne: {
                filter: { name: cfg.name },
                update: {
                    $set: {
                        description: `${cfg.name} system role`,
                        permissionGroups: cfg.permissionGroups,
                        hierarchyLevel: cfg.hierarchyLevel,
                        roleScope: cfg.roleScope,
                        isSystemRole: true,
                        isDefault: cfg.isDefault,
                        isActive: true,
                        updatedBy: SYSTEM_USER_ID,
                        limits: (cfg as any).limits ? structuredClone((cfg as any).limits) : structuredClone(DEFAULT_LIMITS)
                    },
                    $setOnInsert: {
                        permissions: [],
                        createdBy: SYSTEM_USER_ID,
                    },
                },
                upsert: true,
            },
        }));

        if (bulkOps.length > 0) {
            const result = await Role.bulkWrite(bulkOps as any, {
                ordered: false,
                session: session ? (session as any) : undefined
            });
            console.log(`✅ Roles synced: ${result.upsertedCount} created, ${result.modifiedCount} updated.`);
        }
    } catch (error) {
        console.error("❌ Failed to seed roles atomically:", error);
        throw error;
    }

    // 5. Final Step: Ensure Super Admin User exists
    console.log("👤 Step 3: Syncing Super Admin User...");
    await seedSuperAdminUser(session || undefined);

    console.log("--- ✅ Modular Authorization Seeder Finished Successfully ---");
}
