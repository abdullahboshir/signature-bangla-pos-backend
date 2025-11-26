import { PermissionGroup } from "@app/modules/iam/permission/permission-group.model.ts";
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
  let permissionsCreated = 0;
  const existingPermissions = await Permission.find({});
  
  if (existingPermissions.length === 0) {
    console.log("No permissions found. Creating permissions...");
    
    const permissionsToInsert: any[] = [];
    for (const resource of PermissionResourceType as readonly ResourceType[]) {
      for (const action of PermissionActionType as readonly ActionType[]) {
        const id = `${resource}_${action}`.toUpperCase();
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

    await Permission.insertMany(permissionsToInsert, { ordered: false });
    permissionsCreated = permissionsToInsert.length;
    console.log(`✅ ${permissionsCreated} permissions created.`);
  } else {
    console.log(`✅ ${existingPermissions.length} permissions already exist. Skipping permission creation.`);
  }

  const allPermissions = await Permission.find({}).lean();
  const allPermissionIds = allPermissions.map(p => p._id);

  // --------------------------
  // Step 2: PermissionGroups
  // --------------------------
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
  // Step 3: Roles - Create only missing ones
  // --------------------------
  const roleConfigs = [
    {
      name: USER_ROLE.SUPER_ADMIN,
      permissions: allPermissionIds,
      permissionGroups: [fullGroupId],
      hierarchyLevel: 100,
      isDefault: false
    },
    {
      name: USER_ROLE.ADMIN,
      permissions: allPermissionIds,
      permissionGroups: [fullGroupId],
      hierarchyLevel: 90,
      isDefault: false
    },
    // {
    //   name: USER_ROLE.MANAGER,
    //   permissions: allPermissions.filter(p => ["order", "customer", "product", "report"].includes(p.resource)).map(p => p._id),
    //   permissionGroups: [],
    //   hierarchyLevel: 8,
    //   isDefault: false
    // },
    // {
    //   name: USER_ROLE.VENDOR,
    //   permissions: allPermissions.filter(p => ["product", "order", "promotion"].includes(p.resource)).map(p => p._id),
    //   permissionGroups: [],
    //   hierarchyLevel: 7,
    //   isDefault: false
    // },
    {
      name: USER_ROLE.CUSTOMER,
      permissions: allPermissions.filter(p => ["product", "review"].includes(p.resource)).map(p => p._id),
      permissionGroups: [],
      hierarchyLevel: 20,
      isDefault: true
    },
    // {
    //   name: USER_ROLE.DELIVERY_MAN,
    //   permissions: allPermissions.filter(p => ["order", "delivery", "shipping"].includes(p.resource)).map(p => p._id),
    //   permissionGroups: [],
    //   hierarchyLevel: 6,
    //   isDefault: false
    // },
    {
      name: USER_ROLE.SUPPORT_AGENT,
      permissions: allPermissions.filter(p => ["ticket", "customer", "order"].includes(p.resource)).map(p => p._id),
      permissionGroups: [],
      hierarchyLevel: 30,
      isDefault: false
    },
    // {
    //   name: USER_ROLE.GUEST,
    //   permissions: [],
    //   permissionGroups: [],
    //   hierarchyLevel: 1,
    //   isDefault: false
    // }
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
