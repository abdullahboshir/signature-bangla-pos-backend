import { PermissionGroup } from "@app/modules/iam/permission-group/permission-group.model.ts";
import {
  PermissionActionType,
  PermissionResourceType,
  PermissionSourceObj,
  type ActionType,
  type ResourceType,
} from "@app/modules/iam/permission/permission.constant.ts";
import { Permission } from "@app/modules/iam/permission/permission.model.ts";
import { Role } from "@app/modules/iam/role/role.model.ts";
import { RoleScope } from "@app/modules/iam/role/role.constant.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import mongoose, { Types } from "mongoose";

const SYSTEM_USER_ID = new Types.ObjectId(
  process.env["system_user_id"] || "66f000000000000000000000"
);

export async function runRolePermissionSeeder({ clean = false } = {}) {
  console.log("--- Seeder started ---");

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Mongoose is not connected.");
  }

  // --------------------------
  // CLEAN
  // --------------------------
  if (clean) {
    await Permission.deleteMany({});
    await PermissionGroup.deleteMany({});
    await Role.deleteMany({});
    console.log("✅ Cleaned permissions, permission groups and roles.");
  }

  // --------------------------
  // STEP 1: PERMISSIONS (Incremental)
  // --------------------------
  const existingPermissions = await Permission.find({}).select("id").lean();
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

  if (permissionsToInsert.length) {
    try {
      await Permission.insertMany(permissionsToInsert, { ordered: false });
      console.log(`✅ Inserted ${permissionsToInsert.length} new permissions`);
    } catch (error: any) {
      if (error.code === 11000) {
        console.warn("⚠️ Duplicate permissions skipped during seeding (Harmless race condition).");
      } else {
        throw error;
      }
    }
  } else {
    console.log("✅ Permissions already up to date");
  }

  const allPermissions = await Permission.find({}).lean();
  const allPermissionIds = allPermissions.map((p) => p._id);

  // --------------------------
  // STEP 2: PERMISSION GROUPS
  // --------------------------
  const permissionsByResource: Record<string, Types.ObjectId[]> = {};

  for (const perm of allPermissions) {
    if (!perm || !perm.resource || !perm._id) continue;

    // Explicitly cast resource to string to satisfy TS index signature if needed
    const resourceName = perm.resource as string;

    if (!permissionsByResource[resourceName]) {
      permissionsByResource[resourceName] = [];
    }
    permissionsByResource[resourceName].push(perm._id as any);
  }

  const resourceGroupsMap: Record<string, Types.ObjectId> = {};

  for (const [resource, permIds] of Object.entries(permissionsByResource)) {
    const name = `${resource.charAt(0).toUpperCase()}${resource.slice(1)} Management`;

    const group =
      (await PermissionGroup.findOne({ name })) ||
      (await PermissionGroup.create({
        name,
        description: `Manage ${resource}`,
        permissions: permIds,
        resolver: { strategy: "first-match", priority: 5, fallback: "deny" },
        isActive: true,
        createdBy: SYSTEM_USER_ID,
        updatedBy: SYSTEM_USER_ID,
      }));

    // Ensure permissions are up to date (Check before save to avoid redundant writes/audits)
    const currentPerms = group.permissions.map((p: any) => p.toString()).sort().join(',');
    const newPerms = permIds.map((p: any) => p.toString()).sort().join(',');

    if (currentPerms !== newPerms) {
      group.permissions = permIds as any;
      await group.save();
      // console.log(`🔄 Updated group permissions for ${name}`);
    }

    resourceGroupsMap[resource] = group._id;
  }

  // Full Access (Super Admin)
  const fullAccessGroup =
    (await PermissionGroup.findOne({ name: "Full Access Group" })) ||
    (await PermissionGroup.create({
      name: "Full Access Group",
      description: "All permissions",
      permissions: allPermissionIds,
      resolver: { strategy: "cumulative", priority: 10, fallback: "deny" },
      isActive: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    }));

  const currentFullPerms = fullAccessGroup.permissions.map((p: any) => p.toString()).sort().join(',');
  const newFullPerms = allPermissionIds.map((p: any) => p.toString()).sort().join(',');

  if (currentFullPerms !== newFullPerms) {
    fullAccessGroup.permissions = allPermissionIds as any;
    await fullAccessGroup.save();
  }

  const fullGroupId = fullAccessGroup._id;

  const get = (r: string) => resourceGroupsMap[r] || null;

  // --------------------------
  // STEP 3: ROLES (INDUSTRIAL STANDARD)
  // --------------------------
  /* 
   * SYSTEM / GLOBAL ROLES (Platform Level) 
   * Scope: GLOBAL
   */
  /* 
   * SYSTEM / GLOBAL ROLES (Platform Level) 
   * Scope: GLOBAL
   */
  const roleConfigs = [
    {
      name: USER_ROLE.SUPER_ADMIN,
      permissionGroups: [fullGroupId],
      hierarchyLevel: 100,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_ADMIN,
      permissionGroups: [
        get(PermissionSourceObj.user),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.system),
        get(PermissionSourceObj.setting),
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 95,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_SUPPORT,
      permissionGroups: [
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 80,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_FINANCE,
      permissionGroups: [
        get(PermissionSourceObj.account),
        get(PermissionSourceObj.transaction),
        get(PermissionSourceObj.payment),
      ].filter(Boolean),
      hierarchyLevel: 80,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_AUDITOR,
      permissionGroups: [
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.auditLog),
      ].filter(Boolean),
      hierarchyLevel: 70,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_DEVOPS,
      permissionGroups: [
        get(PermissionSourceObj.system),
        get(PermissionSourceObj.backup),
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 85,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_ANALYST,
      permissionGroups: [
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_MARKETING,
      permissionGroups: [
        get(PermissionSourceObj.storefront),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 55,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.PLATFORM_LEGAL,
      permissionGroups: [
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.user),
      ].filter(Boolean),
      hierarchyLevel: 55,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },
    {
      name: USER_ROLE.SYSTEM_INTEGRATION,
      permissionGroups: [
        get(PermissionSourceObj.storefront), // Mapped from webhook/apiKey
        get(PermissionSourceObj.user),
      ].filter(Boolean),
      hierarchyLevel: 50,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
    },

    /* 
     * BUSINESS UNIT ROLES (Tenant Level) 
     * Scope: BUSINESS 
     */
    {
      name: USER_ROLE.ADMIN, // Business Owner/Admin
      permissionGroups: [
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.purchase),
        get(PermissionSourceObj.supplier),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.user),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.account), // Valid
        get(PermissionSourceObj.payment), // Valid
        get(PermissionSourceObj.expense), // Valid
        get(PermissionSourceObj.unit), // Valid general setting
        get(PermissionSourceObj.tax), // Valid general setting
        // get(PermissionSourceObj.leave), // Invalid? Checking... "leave" not in list. 
        // get(PermissionSourceObj.attendance), // Invalid?
        get(PermissionSourceObj.storefront),
      ].filter(Boolean),
      hierarchyLevel: 90,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.MANAGER,
      permissionGroups: [
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.purchase),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.expense),
      ].filter(Boolean),
      hierarchyLevel: 70,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.PURCHASE_MANAGER,
      permissionGroups: [
        get(PermissionSourceObj.purchase),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.supplier),
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.payment),
      ].filter(Boolean),
      hierarchyLevel: 65,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.ASSET_MANAGER,
      permissionGroups: [
        get(PermissionSourceObj.inventory), // Assets tracked as inventory
        get(PermissionSourceObj.expense),
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.ACCOUNTANT,
      permissionGroups: [
        get(PermissionSourceObj.invoice), // Valid
        get(PermissionSourceObj.payment), // Valid
        get(PermissionSourceObj.expense), // Valid
        get(PermissionSourceObj.expenseCategory), // Valid
        get(PermissionSourceObj.tax), // Valid
        get(PermissionSourceObj.report),
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.HR_MANAGER,
      permissionGroups: [
        get(PermissionSourceObj.user),
        // get(PermissionSourceObj.department), // Invalid
        // get(PermissionSourceObj.designation), // Invalid
        // get(PermissionSourceObj.attendance), // Invalid
        // get(PermissionSourceObj.leave), // Invalid
        // get(PermissionSourceObj.payroll), // Invalid
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },

    /* 
     * OUTLET ROLES (Context: Outlet)
     * Scope: OUTLET
     */
    {
      name: USER_ROLE.STORE_KEEPER,
      permissionGroups: [
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.purchase),
        get(PermissionSourceObj.supplier),
        get(PermissionSourceObj.adjustment),
      ].filter(Boolean),
      hierarchyLevel: 40,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.CASHIER,
      permissionGroups: [
        get(PermissionSourceObj.storefront),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.payment),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.return),
        get(PermissionSourceObj.coupon), // Valid
      ].filter(Boolean),
      hierarchyLevel: 30,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.SALES_ASSOCIATE,
      permissionGroups: [
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.quotation), // Valid
      ].filter(Boolean),
      hierarchyLevel: 25,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.WAITER,
      permissionGroups: [
        get(PermissionSourceObj.order), // Taking order
      ].filter(Boolean),
      hierarchyLevel: 20,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.KITCHEN_STAFF,
      permissionGroups: [
        get(PermissionSourceObj.order), // Viewing KDS
      ].filter(Boolean),
      hierarchyLevel: 20,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.PACKAGING_STAFF,
      permissionGroups: [
        get(PermissionSourceObj.order),
      ].filter(Boolean),
      hierarchyLevel: 20,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.DELIVERY_MAN,
      permissionGroups: [
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.customer),
      ].filter(Boolean),
      hierarchyLevel: 20,
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
    {
      name: USER_ROLE.STAFF, // General Staff
      permissionGroups: [
        // Attendance/Leave not in core list yet?
      ].filter(Boolean),
      hierarchyLevel: 15,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },

    /* 
     * END USER (Global)
     */
    {
      name: USER_ROLE.CUSTOMER,
      permissionGroups: [
        get(PermissionSourceObj.cart),
        get(PermissionSourceObj.wishlist),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.review),
      ].filter(Boolean),
      hierarchyLevel: 5,
      roleScope: RoleScope.GLOBAL,
      isDefault: true,
    },
  ];

  // --------------------------
  // ATOMIC BULK WRITE EXECUTION
  // --------------------------
  try {
    const bulkOps = roleConfigs.map((cfg) => ({
      updateOne: {
        filter: { name: cfg.name },
        update: {
          $set: {
            description: `${cfg.name} system role`,
            permissions: [],
            permissionGroups: cfg.permissionGroups,
            hierarchyLevel: cfg.hierarchyLevel,
            roleScope: cfg.roleScope,
            isSystemRole: true,
            isDefault: cfg.isDefault,
            isActive: true,
            updatedBy: SYSTEM_USER_ID,
          },
          $setOnInsert: {
            createdBy: SYSTEM_USER_ID,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      const result = await Role.bulkWrite(bulkOps as any);
      console.log(`✅ Roles synced: ${result.upsertedCount} created, ${result.modifiedCount} updated.`);
    }
  } catch (error) {
    console.error("❌ Failed to seed roles atomically:", error);
    throw error; // Re-throw to stop the process if seeded partially
  }

  console.log("--- Seeder finished successfully ---");
}
