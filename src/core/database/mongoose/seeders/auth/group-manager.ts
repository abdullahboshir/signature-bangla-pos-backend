import { PermissionGroup } from "@app/modules/iam/permission-group/permission-group.model.js";
import { Permission } from "@app/modules/iam/permission/permission.model.js";
import { PermissionActionType, PermissionSourceObj } from "@app/modules/iam/permission/permission.resource.js";
import { getModuleByResource } from "@app/modules/iam/permission/module.constant.js";
import { getScopeForResource } from "./data/scope-map.js";
import mongoose, { Types } from "mongoose";
import { SYSTEM_USER_ID } from "./data/constants.js";

/**
 * Ensures all individual permissions (Resource:Action) exist in the database.
 */
export async function syncPermissions(session?: mongoose.ClientSession): Promise<void> {
    const resourceList = Object.values(PermissionSourceObj);
    const actionList = Object.values(PermissionActionType);

    const permissionOps = [];

    for (const resource of resourceList) {
        const defaultScope = getScopeForResource(resource as string);
        const module = getModuleByResource(resource as string) || "system";

        for (const action of actionList) {
            const name = `${resource}:${action}`;

            permissionOps.push({
                updateOne: {
                    filter: { id: name },
                    update: {
                        $set: {
                            id: name,
                            resource: resource as string,
                            action: action as string,
                            module,
                            description: `Permission to ${action} ${resource}`,
                            scope: defaultScope,
                            isActive: true,
                            updatedBy: SYSTEM_USER_ID,
                        },
                        $setOnInsert: {
                            createdBy: SYSTEM_USER_ID,
                        },
                    },
                    upsert: true,
                },
            });
        }
    }

    if (permissionOps.length > 0) {
        try {
            const options: any = { ordered: false };
            if (session) {
                options.session = session;
            }

            const result = await Permission.bulkWrite(permissionOps as any, options);
            console.log(`✅ ${permissionOps.length} Permissions synced.`);
            console.log(`   Detailed Result: Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}, Inserted: ${result.insertedCount}, Matched: ${result.matchedCount}`);
            if (result.hasWriteErrors()) {
                console.error("❌ BulkWrite has errors:", result.getWriteErrors());
            }

            const count = await Permission.countDocuments();
            console.log(`[DEBUG] Immediate count after syncPermissions: ${count}`);

        } catch (error) {
            console.error("❌ Permission sync failed:", error);
            throw error;
        }
    } else {
        console.log("ℹ️ No permissions to sync.");
    }
}

/**
 * Ensures all permissions for a resource exist and are grouped into a PermissionGroup.
 * Returns a map of resource names to their corresponding PermissionGroup IDs.
 */
export async function syncResourceGroups(session?: mongoose.ClientSession): Promise<Record<string, mongoose.Types.ObjectId>> {
    const resourceGroupsMap: Record<string, mongoose.Types.ObjectId> = {};

    // 1. Get all available permissions
    const allPermissions = await Permission.find({}).session(session || null);
    console.log(`[DEBUG] syncResourceGroups found ${allPermissions.length} permissions in DB.`);

    // 2. Group permissions by resource
    const permissionsByResource: Record<string, mongoose.Types.ObjectId[]> = {};
    allPermissions.forEach((p: any) => {
        const resourceName = p.resource as string;
        if (!resourceName) return;

        if (!permissionsByResource[resourceName]) {
            permissionsByResource[resourceName] = [];
        }

        const bucket = permissionsByResource[resourceName];
        if (bucket) {
            bucket.push(p._id as mongoose.Types.ObjectId);
        }
    });

    const allPermissionIds = allPermissions.map((p: any) => (p._id as mongoose.Types.ObjectId));

    // 3. Create or Update Permission Groups for each resource
    const dbOptions = session ? { session } : undefined;

    for (const [resource, permIds] of Object.entries(permissionsByResource)) {
        const groupModule = getModuleByResource(resource) || 'system';
        const name = `${groupModule}.${resource}`;

        let group = await PermissionGroup.findOne({ name }).session(session ?? null);

        // DEBUG: Double check with native driver if mongoose misses it
        if (!group) {
            const nativeGroup = await mongoose.connection.db?.collection("permissiongroups").findOne({ name }, dbOptions as any);
            if (nativeGroup) {
                console.error(`🚨 CRITICAL: Mongoose missed existing group '${name}' but Native found it! Possible Schema/Plugin issue.`);
                // Recover by using the native ID but we can't fully use it as a doc without hydration, 
                // but better to skip creation.
                console.log("   Recovering: treating as found.");
                group = nativeGroup as any;
            }
        }

        if (!group) {
            try {
                const created = await PermissionGroup.create([{
                    name,
                    module: groupModule,
                    description: `Manage ${resource}`,
                    permissions: permIds,
                    resolver: { strategy: "first-match", priority: 5, fallback: "deny" },
                    isActive: true,
                    createdBy: SYSTEM_USER_ID,
                    updatedBy: SYSTEM_USER_ID,
                }], dbOptions as any) as any;
                group = created[0];
            } catch (e: any) {
                if (e.code === 11000) {
                    console.log(`⚠️ Race condition avoided for ${name}, fetching again.`);
                    group = await PermissionGroup.findOne({ name }).session(session ?? null);
                } else {
                    console.log(`⚠️ Group creation failed for ${name}, might exist.`, e.message);
                    continue;
                }
            }
        } else {
            // Existing group logic
            // Check if we need to update permissions
            const currentPermIds = group.permissions.map((p: any) => p.toString());
            const newPermIds = permIds.map(p => p.toString());

            const isSame =
                currentPermIds.length === newPermIds.length &&
                currentPermIds.every(id => newPermIds.includes(id));

            if (!isSame) {
                // Determine if 'group' is a Mongoose document or POJO from native recovery
                if (group instanceof mongoose.Model || typeof (group as any).save === 'function') {
                    group.permissions = permIds as any;
                    await group.save(dbOptions as any);
                } else {
                    await PermissionGroup.updateOne(
                        { _id: group._id },
                        { $set: { permissions: permIds } },
                        dbOptions as any
                    );
                }
            }
        }

        if (group) {
            resourceGroupsMap[resource] = group._id as Types.ObjectId;
        }
    }

    // 4. Create/Sync Full Access Group
    try {
        let fullAccessGroup = await PermissionGroup.findOne({ name: "system.full_access" }).session(session ?? null);
        if (!fullAccessGroup) {
            try {
                const created = await PermissionGroup.create([{
                    name: "system.full_access",
                    module: 'system',
                    description: "All permissions (Technical Full Access)",
                    permissions: allPermissionIds,
                    resolver: { strategy: "cumulative", priority: 10, fallback: "deny" },
                    isActive: true,
                    createdBy: SYSTEM_USER_ID,
                    updatedBy: SYSTEM_USER_ID,
                }], dbOptions as any) as any;
                fullAccessGroup = created[0];
            } catch (e: any) {
                if (e.code === 11000) {
                    console.log(`⚠️ Race condition avoided for system.full_access.`);
                    fullAccessGroup = await PermissionGroup.findOne({ name: "system.full_access" }).session(session ?? null);
                } else {
                    throw e;
                }
            }
        } else {
            if (fullAccessGroup.permissions.length !== allPermissionIds.length) {
                fullAccessGroup.permissions = allPermissionIds as any;
                await fullAccessGroup.save(dbOptions as any);
            }
        }
        if (fullAccessGroup) {
            resourceGroupsMap['FULL_ACCESS'] = fullAccessGroup._id as Types.ObjectId;
        }
    } catch (e) {
        console.error("❌ Failed to sync full access group:", e);
    }

    return resourceGroupsMap;
}

/**
 * Performs a final audit to ensure all resources defined in PermissionSourceObj have groups.
 */
export function auditResourceGroups(resourceGroupsMap: Record<string, Types.ObjectId>) {
    const missingGroups = Object.values(PermissionSourceObj).filter(r => !resourceGroupsMap[r as string]);
    if (missingGroups.length > 0) {
        console.warn(`⚠️  CRITICAL: Missing Permission Groups for resources in PermissionSourceObj:`, missingGroups);
    } else {
        console.log("✅  All resources in PermissionSourceObj have valid PermissionGroups.");
    }
}
