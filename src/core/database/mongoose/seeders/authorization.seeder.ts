import { PermissionGroup } from "@app/modules/iam/permission-group/permission-group.model.ts";
import { PermissionActionType, PermissionResourceType, type ActionType, type ResourceType } from "@app/modules/iam/permission/permission.constant.ts";
import { Permission } from "@app/modules/iam/permission/permission.model.ts";
import { Role } from "@app/modules/iam/role/role.model.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import mongoose, { Types } from "mongoose";



const SYSTEM_USER_ID = new Types.ObjectId(
  process.env['system_user_id'] || "66f000000000000000000000"
);

export async function runRolePermissionSeeder({ clean = false } = {}) {
  console.log("--- Seeder started ---");

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Mongoose is not connected.");
  }

  // Clean if requested
  if (clean) {
    await Permission.deleteMany({});
    await PermissionGroup.deleteMany({}); // ✅ Clean PermissionGroups
    await Role.deleteMany({});
    console.log("✅ Cleaned existing permissions, permission groups and roles.");
  }

  // --------------------------
  // Step 1: Permissions - Create only if empty
  // --------------------------
  // --------------------------
  // Step 1: Permissions - Incremental Sync
  // --------------------------
  let permissionsCreated = 0;
  const existingPermissions = await Permission.find({}).select('id').lean();
  const existingPermissionIds = new Set(existingPermissions.map((p: any) => p.id));

  const permissionsToInsert: any[] = [];
  for (const resource of PermissionResourceType as readonly ResourceType[]) {
    for (const action of PermissionActionType as readonly ActionType[]) {
      const id = `${resource}_${action}`.toUpperCase();

      if (!existingPermissionIds.has(id)) {
        permissionsToInsert.push({
          id,
          resource,
          action,
          scope: "global",
          effect: "allow",
          attributes: [],
          conditions: [],
          resolver: { strategy: "first-match", fallback: "deny" },
          description: `Permission to ${action} ${resource}`,
          isActive: true,
          createdBy: SYSTEM_USER_ID,
          updatedBy: SYSTEM_USER_ID,
        });
      }
    }
  }

  if (permissionsToInsert.length > 0) {
    await Permission.insertMany(permissionsToInsert, { ordered: false });
    permissionsCreated = permissionsToInsert.length;
    console.log(`✅ Added ${permissionsCreated} NEW permissions.`);
  } else {
    console.log(`✅ All permissions are up to date (${existingPermissionIds.size} total).`);
  }

  const allPermissions = await Permission.find({}).lean();
  const allPermissionIds = allPermissions.map(p => p._id);

  // --------------------------
  // Step 2: PermissionGroups (Granular + Full Access)
  // --------------------------

  // 2.1: Create Granular Groups (Resource-Based)
  // Group permissions by resource
  const permissionsByResource: Record<string, Types.ObjectId[]> = {};

  for (const perm of allPermissions) {
    if (!perm || !perm.resource) continue;
    const resource = perm.resource as string;

    if (!permissionsByResource[resource]) {
      permissionsByResource[resource] = [];
    }
    permissionsByResource[resource].push(perm._id as Types.ObjectId);
  }

  let groupsCreated = 0;
  const resourceGroupsMap: Record<string, Types.ObjectId> = {};

  for (const [resource, permIds] of Object.entries(permissionsByResource)) {
    const groupName = `${resource.charAt(0).toUpperCase() + resource.slice(1)} Management`;
    const existingGroup = await PermissionGroup.findOne({ name: groupName });

    if (!existingGroup) {
      const newGroup = await PermissionGroup.create({
        name: groupName,
        description: `Manage all ${resource} related permissions`,
        permissions: permIds,
        resolver: { strategy: "first-match", priority: 5, fallback: "deny" },
        isActive: true,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      resourceGroupsMap[resource] = newGroup._id;
      groupsCreated++;
    } else {
      // Update permissions if needed (optional sync)
      // For now, just track the ID
      resourceGroupsMap[resource] = existingGroup._id;
    }
  }
  console.log(`✅ Verified/Created ${groupsCreated} Resource-Based Permission Groups.`);

  // 2.2: Full Access Group
  const fullAccessGroup = await PermissionGroup.findOne({ name: "Full Access Group" });
  let fullGroupId: Types.ObjectId;

  if (!fullAccessGroup) {
    const group = await PermissionGroup.create({
      name: "Full Access Group",
      description: "Contains all permissions for Super Admin",
      permissions: allPermissionIds,
      resolver: { strategy: "cumulative", priority: 10, fallback: "deny" },
      isActive: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    });
    fullGroupId = group._id;
    console.log("✅ Created Full Access PermissionGroup");
  } else {
    fullGroupId = fullAccessGroup._id;
    console.log("✅ Full Access PermissionGroup already exists");
  }

  // --------------------------
  // Step 3: Roles - Create only data if missing
  // --------------------------

  // Helpers to get group IDs safely
  const getGroupId = (res: string) => resourceGroupsMap[res] || null;

  const roleConfigs = [
    {
      name: USER_ROLE.SUPER_ADMIN,
      permissions: [], // Using Full Access Group instead
      permissionGroups: [fullGroupId],
      hierarchyLevel: 100,
      isDefault: false
    },
    {
      name: USER_ROLE.ADMIN,
      permissions: [],
      permissionGroups: [fullGroupId], // Admin gets full access too, or can be restricted
      hierarchyLevel: 90,
      isDefault: false
    },
    {
      name: USER_ROLE.CUSTOMER,
      permissions: [],
      // Assign specific groups: Product, Review, maybe Profile/User
      permissionGroups: [
        getGroupId('product'),
        getGroupId('review'),
        getGroupId('cart'),
        getGroupId('wishlist')
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 10,
      isDefault: true
    },
    {
      name: USER_ROLE.SUPPORT_AGENT,
      permissions: [],
      // specific groups: Ticket, Customer, Order, Return
      permissionGroups: [
        getGroupId('ticket'),
        getGroupId('customer'),
        getGroupId('order'),
        getGroupId('return'),
        getGroupId('refund')
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 30,
      isDefault: false
    },
    {
      name: USER_ROLE.CASHIER,
      permissions: [],
      permissionGroups: [
        getGroupId('storefront'),
        getGroupId('order'),
        getGroupId('payment'),
        getGroupId('customer'),
        getGroupId('return')
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 20,
      isDefault: false
    }
  ];

  let rolesCreated = 0;
  for (const roleConfig of roleConfigs) {
    const existingRole = await Role.findOne({ name: roleConfig.name });

    if (!existingRole) {
      await Role.create({
        name: roleConfig.name,
        description: `${roleConfig.name} default role`,
        permissions: roleConfig.permissions,
        permissionGroups: roleConfig.permissionGroups,
        isSystemRole: true,
        isDefault: roleConfig.isDefault,
        isActive: true,
        hierarchyLevel: roleConfig.hierarchyLevel,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      });
      rolesCreated++;
      console.log(`✅ Created role: ${roleConfig.name}`);
    } else {
      console.log(`✅ Role already exists: ${roleConfig.name}`);
    }
  }

  console.log(`--- Seeder finished. Created ${rolesCreated} new roles. ---`);
}
