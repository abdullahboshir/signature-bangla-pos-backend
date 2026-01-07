import { PermissionGroup } from "@app/modules/iam/permission-group/permission-group.model.ts";
import { Permission } from "@app/modules/iam/permission/permission.model.ts";
import { PermissionActionType, PermissionSourceObj } from "@app/modules/iam/permission/permission.constant.ts";
import { getModuleByResource } from "@app/modules/iam/permission/module.constant.ts";
import { getScopeForResource } from "./data/scope-map.ts";
import mongoose, { Types } from "mongoose";
import { SYSTEM_USER_ID } from "./data/constants.ts";

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
                    filter: { name },
                    update: {
                        $set: {
                            name,
                            resource: resource as string,
                            action: action as string,
                            module,
                            description: `Permission to ${action} ${resource}`,
                            defaultScope,
                            status: "active",
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
        await Permission.bulkWrite(permissionOps as any, {
            ordered: false,
            session: session as any
        });
        console.log(`✅ ${permissionOps.length} Permissions synced.`);
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
    for (const [resource, permIds] of Object.entries(permissionsByResource)) {
        const groupModule = getModuleByResource(resource) || 'system';
        const name = `${groupModule}.${resource}`;
        let group = await PermissionGroup.findOne({ name }).session(session || null);

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
                }], session ? { session } : {}) as any;
                group = created[0];
            } catch (e) {
                console.log(`⚠️ Group creation failed for ${name}, might exist.`, e);
                continue;
            }
        } else {
            // Content-aware sync
            const isSame =
                group.permissions.length === permIds.length &&
                group.permissions.every(id => permIds.some(p => p.toString() === id.toString()));

            if (!isSame) {
                group.permissions = permIds as any;
                await group.save(session ? { session } : {});
            }
        }

        if (group) {
            resourceGroupsMap[resource] = group._id as Types.ObjectId;
        }
    }

    // 4. Create/Sync Full Access Group (Special Technical Group)
    let fullAccessGroup = await PermissionGroup.findOne({ name: "system.full_access" }).session(session || null);
    if (!fullAccessGroup) {
        const created = await PermissionGroup.create([{
            name: "system.full_access",
            module: 'system',
            description: "All permissions (Technical Full Access)",
            permissions: allPermissionIds,
            resolver: { strategy: "cumulative", priority: 10, fallback: "deny" },
            isActive: true,
            createdBy: SYSTEM_USER_ID,
            updatedBy: SYSTEM_USER_ID,
        }], session ? { session } : {}) as any;
        fullAccessGroup = created[0];
    } else {
        if (fullAccessGroup.permissions.length !== allPermissionIds.length) {
            fullAccessGroup.permissions = allPermissionIds as any;
            await fullAccessGroup.save(session ? { session } : {});
        }
    }

    resourceGroupsMap['FULL_ACCESS'] = fullAccessGroup!._id as Types.ObjectId;

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
