import { PermissionGroup } from "@app/modules/iam/permission-group/permission-group.model.ts";
import { PermissionActionType, PermissionResourceType, PermissionSourceObj, type ActionType, type ResourceType } from "@app/modules/iam/permission/permission.constant.ts";
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
      // Update permissions to ensure they are in sync (fix for stale IDs)
      existingGroup.permissions = permIds as any;
      await existingGroup.save();
      resourceGroupsMap[resource] = existingGroup._id;
      // console.log(`🔄 Updated permissions for group: ${groupName}`);
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
    // Sync full access permissions
    fullAccessGroup.permissions = allPermissionIds as any;
    await fullAccessGroup.save();
    fullGroupId = fullAccessGroup._id;
    console.log("✅ Updated Full Access PermissionGroup permissions");
  }

  // --------------------------
  // Step 3: Roles - Create only data if missing
  // --------------------------

  // Helpers to get group IDs safely
  const getGroupId = (res: string) => resourceGroupsMap[res] || null;

  /* Use PermissionSourceObj for Type Safety */
  const roleConfigs = [
    {
      name: USER_ROLE.SUPER_ADMIN,
      permissions: [],
      permissionGroups: [fullGroupId], // 👑 God Mode
      hierarchyLevel: 100,
      isDefault: false
    },
    {
      name: USER_ROLE.ADMIN,
      permissions: [],
      // 💼 Business Admin: Full Operational Access, No System/Dev ops
      permissionGroups: [
        getGroupId(PermissionSourceObj.product),
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.inventory),
        getGroupId(PermissionSourceObj.purchase),
        getGroupId(PermissionSourceObj.supplier),
        getGroupId(PermissionSourceObj.customer),
        getGroupId(PermissionSourceObj.user),      // Manage Staff
        getGroupId(PermissionSourceObj.role),      // Manage Business Roles
        getGroupId(PermissionSourceObj.report),
        getGroupId(PermissionSourceObj.finance),
        getGroupId(PermissionSourceObj.expense),
        getGroupId(PermissionSourceObj.payment),
        getGroupId(PermissionSourceObj.department), // hrm/marketing might not exist, use department/leave etc
        getGroupId(PermissionSourceObj.leave),
        getGroupId(PermissionSourceObj.attendance),
        getGroupId(PermissionSourceObj.storefront)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 90,
      isDefault: false
    },
    {
      name: USER_ROLE.MANAGER,
      permissions: [],
      // 👔 Manager: Operations & Staff Management
      permissionGroups: [
        getGroupId(PermissionSourceObj.product),
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.inventory),
        getGroupId(PermissionSourceObj.purchase),
        getGroupId(PermissionSourceObj.supplier),
        getGroupId(PermissionSourceObj.customer),
        getGroupId(PermissionSourceObj.user),
        getGroupId(PermissionSourceObj.report),
        getGroupId(PermissionSourceObj.expense),
        getGroupId(PermissionSourceObj.attendance), // hrm decomposed
        getGroupId(PermissionSourceObj.leave)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 50,
      isDefault: false
    },
    {
      name: USER_ROLE.ACCOUNTANT,
      permissions: [],
      // 📊 Accountant: Strict Financial Access
      permissionGroups: [
        getGroupId(PermissionSourceObj.finance),
        getGroupId(PermissionSourceObj.expense),
        getGroupId(PermissionSourceObj.report),
        getGroupId(PermissionSourceObj.payment),
        getGroupId(PermissionSourceObj.account)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 60,
      isDefault: false
    },
    {
      name: USER_ROLE.HR_MANAGER,
      permissions: [],
      // 👥 HR Manager: Staff & Payroll
      permissionGroups: [
        getGroupId(PermissionSourceObj.user),      // Manage Staff
        getGroupId(PermissionSourceObj.role),      // Assign roles
        getGroupId(PermissionSourceObj.department),
        getGroupId(PermissionSourceObj.designation),
        getGroupId(PermissionSourceObj.attendance),
        getGroupId(PermissionSourceObj.leave),
        getGroupId(PermissionSourceObj.payroll)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 60,
      isDefault: false
    },
    {
      name: USER_ROLE.SALES_ASSOCIATE,
      permissions: [],
      // 🛍️ Sales Associate: CRM & Draft Orders
      permissionGroups: [
        getGroupId(PermissionSourceObj.customer),
        getGroupId(PermissionSourceObj.product),
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.storefront)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 15,
      isDefault: false
    },
    {
      name: USER_ROLE.DELIVERY_MAN,
      permissions: [],
      // 🚚 Delivery: Order Status & Routes
      permissionGroups: [
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.courier),
        getGroupId(PermissionSourceObj.customer)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 10,
      isDefault: false
    },
    {
      name: USER_ROLE.CASHIER,
      permissions: [],
      // 💰 Cashier: POS & Order Fulfillment
      permissionGroups: [
        getGroupId(PermissionSourceObj.storefront), // covers POS usually
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.payment),
        getGroupId(PermissionSourceObj.customer),
        getGroupId(PermissionSourceObj.return),
        getGroupId(PermissionSourceObj.product)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 20,
      isDefault: false
    },
    {
      name: USER_ROLE.STORE_KEEPER,
      permissions: [],
      // 📦 Store Keeper: Inventory & Stock
      permissionGroups: [
        getGroupId(PermissionSourceObj.inventory),
        getGroupId(PermissionSourceObj.purchase),
        getGroupId(PermissionSourceObj.supplier),
        getGroupId(PermissionSourceObj.product),
        getGroupId(PermissionSourceObj.adjustment)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 25,
      isDefault: false
    },
    {
      name: USER_ROLE.CUSTOMER,
      permissions: [],
      permissionGroups: [
        getGroupId(PermissionSourceObj.cart),
        getGroupId(PermissionSourceObj.wishlist),
        getGroupId(PermissionSourceObj.order),
        getGroupId(PermissionSourceObj.review)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 10,
      isDefault: true
    },
    {
      name: USER_ROLE.STAFF,
      permissions: [],
      permissionGroups: [
        getGroupId(PermissionSourceObj.attendance),
        getGroupId(PermissionSourceObj.leave),
        getGroupId(PermissionSourceObj.storefront)
      ].filter(id => id !== null) as Types.ObjectId[],
      hierarchyLevel: 15,
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
      // Force update logic for System Roles to ensure they match the code definition
      // This fixes the issue where Admin keeps old "Full Access" even after we changed code
      existingRole.permissionGroups = roleConfig.permissionGroups as any;
      existingRole.permissions = roleConfig.permissions as any;
      existingRole.hierarchyLevel = roleConfig.hierarchyLevel;
      existingRole.isDefault = roleConfig.isDefault;

      // We don't overwrite name/description to allow some customization, 
      // but permissions for system roles should ideally stay synced or be additive.
      // Here we choose to SYNC (overwrite) to enforce the "Standard" definition.
      await existingRole.save();
      console.log(`🔄 Updated/Synced system role: ${roleConfig.name}`);
    }
  }

  console.log(`--- Seeder finished. Created ${rolesCreated} new roles. ---`);
}
