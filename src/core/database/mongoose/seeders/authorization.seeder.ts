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
import { getModuleByResource } from "@app/modules/iam/permission/module.constant.ts";
import mongoose, { Types } from "mongoose";

const SYSTEM_USER_ID = new Types.ObjectId(
  process.env["system_user_id"] || "66f000000000000000000000"
);

const DEFAULT_LIMITS = {
  financial: { maxDiscountPercent: 0, maxDiscountAmount: 0, maxRefundAmount: 0, maxCreditLimit: 0, maxCashTransaction: 0 },
  dataAccess: { maxProducts: 0, maxOrders: 0, maxCustomers: 0, maxOutlets: 0, maxWarehouses: 0 },
  security: { maxLoginSessions: 1, ipWhitelistEnabled: false, loginTimeRestricted: false },
  approval: { maxPurchaseOrderAmount: 0, maxExpenseEntry: 0 }
};

export async function runRolePermissionSeeder({ clean = false, session }: { clean?: boolean, session?: mongoose.ClientSession } = {}) {
  console.log("--- Seeder started ---");

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Mongoose is not connected.");
  }

  // --------------------------
  // CLEAN
  // --------------------------
  if (clean) {
    const options = session ? { session } : {};
    await Permission.deleteMany({}, options);
    await PermissionGroup.deleteMany({}, options);
    await Role.deleteMany({}, options);
    console.log("✅ Cleaned permissions, permission groups and roles.");
  }

  // --------------------------
  // STEP 1: PERMISSIONS (Upsert via BulkWrite for Atomicity)
  // --------------------------
  console.log("   Authorized Seeding: Syncing Permissions...");

  const permissionOps = [];

  for (const resource of PermissionResourceType as readonly ResourceType[]) {
    for (const action of PermissionActionType as readonly ActionType[]) {
      const id = `${resource}_${action}`.toUpperCase();

      // Determine default scope based on resource type (Heuristic)
      let defaultScope = "business"; // Most are business level
      if (['system', 'plugin', 'currency', 'language', 'theme', 'backup', 'auditLog'].includes(resource)) {
        defaultScope = "global";
      } else if (['pos', 'cashRegister', 'terminal'].includes(resource)) {
        defaultScope = "outlet";
      }

      permissionOps.push({
        updateOne: {
          filter: { id },
          update: {
            $set: {
              resource,
              action,
              module: getModuleByResource(resource) || 'system',
              scope: defaultScope,
              effect: "allow",
              description: `Permission to ${action} ${resource}`,
              isActive: true,
              updatedBy: SYSTEM_USER_ID,
            },
            $setOnInsert: {
              attributes: [],
              conditions: [],
              resolver: { strategy: "first-match", fallback: "deny" },
              createdBy: SYSTEM_USER_ID,
            }
          },
          upsert: true
        }
      });
    }
  }

  if (permissionOps.length > 0) {
    try {
      const BATCH_SIZE = 500;
      for (let i = 0; i < permissionOps.length; i += BATCH_SIZE) {
        const batch = permissionOps.slice(i, i + BATCH_SIZE);
        await Permission.bulkWrite(batch as any, session ? { session } : {});
        console.log(`✅ Synced permissions batch ${i / BATCH_SIZE + 1} (${batch.length} items)`);
      }
    } catch (error: any) {
      console.error("❌ Permission Sync Failed:", error.message || error);
      throw error;
    }
  }

  const allPermissions = await Permission.find({}).session(session || null).lean();
  const allPermissionIds = allPermissions.map((p) => p._id);

  // --------------------------
  // STEP 2: PERMISSION GROUPS
  // --------------------------
  const permissionsByResource: Record<string, Types.ObjectId[]> = {};

  for (const perm of allPermissions) {
    if (!perm || !perm.resource || !perm._id) continue;
    const resourceName = perm.resource as string;
    if (!permissionsByResource[resourceName]) {
      permissionsByResource[resourceName] = [];
    }
    permissionsByResource[resourceName].push(perm._id as any);
  }

  const resourceGroupsMap: Record<string, Types.ObjectId> = {};

  for (const [resource, permIds] of Object.entries(permissionsByResource)) {
    const name = `${resource.charAt(0).toUpperCase()}${resource.slice(1)} Management`;

    let group = await PermissionGroup.findOne({ name }).session(session || null);

    if (!group) {
      // Safe creation
      try {
        const created = await PermissionGroup.create([{
          name,
          module: getModuleByResource(resource) || 'system',
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
      // Update check
      if (group.permissions.length !== permIds.length) {
        group.permissions = permIds as any;
        await group.save(session ? { session } : {});
      }
    }

    if (group) {
      resourceGroupsMap[resource] = group._id as Types.ObjectId;
    }
  }

  // Full Access (Super Admin)
  let fullAccessGroup = await PermissionGroup.findOne({ name: "Full Access Group" }).session(session || null);
  if (!fullAccessGroup) {
    // Create if missing
    const created = await PermissionGroup.create([{
      name: "Full Access Group",
      module: 'system',
      description: "All permissions",
      permissions: allPermissionIds,
      resolver: { strategy: "cumulative", priority: 10, fallback: "deny" },
      isActive: true,
      createdBy: SYSTEM_USER_ID,
      updatedBy: SYSTEM_USER_ID,
    }], session ? { session } : {}) as any;
    fullAccessGroup = created[0];
  } else {
    // Sync permissions
    if (fullAccessGroup.permissions.length !== allPermissionIds.length) {
      fullAccessGroup.permissions = allPermissionIds as any;
      await fullAccessGroup.save(session ? { session } : {});
    }
  }
  const fullGroupId = fullAccessGroup!._id as Types.ObjectId;

  // Helper to safely get group ID
  const get = (r: string) => resourceGroupsMap[r] || null;

  // --------------------------
  // STEP 3: ROLES (INDUSTRIAL STANDARD & RESTORED)
  // --------------------------
  /* 
   * SYSTEM / GLOBAL ROLES (Platform Level) 
   * Scope: GLOBAL
   */

  const roleConfigs: any[] = [
    // 🔴 LEVEL 1: SUPER-ADMIN (Platform)
    {
      name: USER_ROLE.SUPER_ADMIN,
      permissionGroups: [
        get(PermissionSourceObj.system),
        get(PermissionSourceObj.setting),
        get(PermissionSourceObj.backup),
        get(PermissionSourceObj.auditLog),
        get(PermissionSourceObj.apiKey),
        get(PermissionSourceObj.webhook),
        get(PermissionSourceObj.plugin),
        get(PermissionSourceObj.theme),
        get(PermissionSourceObj.language),
        get(PermissionSourceObj.currency),
        get(PermissionSourceObj.zone),
        get(PermissionSourceObj.blacklist),
        get(PermissionSourceObj.analytics),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.dashboard),
        get(PermissionSourceObj.account),
        get(PermissionSourceObj.subscription),
        get(PermissionSourceObj.payout),
        get(PermissionSourceObj.settlement),
        get(PermissionSourceObj.reconciliation),
        get(PermissionSourceObj.transaction),
        get(PermissionSourceObj.user),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.permission),
        get(PermissionSourceObj.businessUnit),
        get(PermissionSourceObj.notification),
        get(PermissionSourceObj.emailTemplate),
        get(PermissionSourceObj.smsTemplate),
      ].filter(Boolean),
      hierarchyLevel: 100,
      roleScope: RoleScope.GLOBAL,
      isDefault: false,
      limits: DEFAULT_LIMITS
    },
    {
      name: USER_ROLE.PLATFORM_ADMIN,
      permissionGroups: [
        get(PermissionSourceObj.user),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.system),
        get(PermissionSourceObj.setting),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.billing),
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
     * COMPANY ROLES (Tenant Level) 
     * Scope: COMPANY 
     */
    {
      name: USER_ROLE.COMPANY_OWNER, // Group Chairman/MD
      permissionGroups: [
        get(PermissionSourceObj.businessUnit), // Manage Business Units
        get(PermissionSourceObj.user), // Manage Admin Users
        get(PermissionSourceObj.role), // Manage Roles
        get(PermissionSourceObj.report), // All Reports
        get(PermissionSourceObj.dashboard), // Global Dashboard
        get(PermissionSourceObj.subscription), // Manage SaaS Subscription
        get(PermissionSourceObj.billing), // Pay SaaS Fees
        // Governance
        get(PermissionSourceObj.shareholder),
        get(PermissionSourceObj.voting),
        get(PermissionSourceObj.meeting),
        get(PermissionSourceObj.compliance),
      ].filter(Boolean),
      hierarchyLevel: 95,
      roleScope: RoleScope.COMPANY, // New Scope
      isDefault: false,
    },
    {
      name: USER_ROLE.SHAREHOLDER,
      permissionGroups: [
        get(PermissionSourceObj.voting),
        get(PermissionSourceObj.meeting),
        get(PermissionSourceObj.compliance),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.dashboard),
      ].filter(Boolean),
      hierarchyLevel: 80,
      roleScope: RoleScope.COMPANY, // Changed default to COMPANY so they can be global investors by default, or overridden to BUSINESS in assignment
      isDefault: false,
    },

    /* 
     * BUSINESS UNIT ROLES (Vertical Level) 
     * Scope: BUSINESS 
     */
    {
      name: USER_ROLE.ADMIN, // Business Owner/Admin
      permissionGroups: [
        get(PermissionSourceObj.businessUnit), // Added for Settings access
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.category),
        get(PermissionSourceObj.brand),
        get(PermissionSourceObj.attribute),
        get(PermissionSourceObj.attributeGroup),
        get(PermissionSourceObj.unit),
        get(PermissionSourceObj.tax),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.quotation),
        get(PermissionSourceObj.invoice),
        get(PermissionSourceObj.return),
        get(PermissionSourceObj.review),
        get(PermissionSourceObj.coupon),
        get(PermissionSourceObj.promotion),
        get(PermissionSourceObj.abandonedCart),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.wishlist),
        get(PermissionSourceObj.cart),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.warehouse),
        get(PermissionSourceObj.purchase),
        get(PermissionSourceObj.supplier),
        get(PermissionSourceObj.vendor),
        get(PermissionSourceObj.adjustment),
        get(PermissionSourceObj.transfer),
        get(PermissionSourceObj.outlet),
        get(PermissionSourceObj.storefront),
        get(PermissionSourceObj.terminal),
        get(PermissionSourceObj.cashRegister),
        get(PermissionSourceObj.payment),
        get(PermissionSourceObj.expense),
        get(PermissionSourceObj.expenseCategory),
        get(PermissionSourceObj.budget),
        get(PermissionSourceObj.account),
        get(PermissionSourceObj.transaction),
        get(PermissionSourceObj.staff),
        get(PermissionSourceObj.attendance),
        get(PermissionSourceObj.leave),
        get(PermissionSourceObj.payroll),
        get(PermissionSourceObj.department),
        get(PermissionSourceObj.designation),
        get(PermissionSourceObj.asset),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.user),
        get(PermissionSourceObj.affiliate),
        get(PermissionSourceObj.adCampaign),
        get(PermissionSourceObj.loyalty),
        get(PermissionSourceObj.subscription),
        get(PermissionSourceObj.notification),
        get(PermissionSourceObj.emailTemplate),
        get(PermissionSourceObj.smsTemplate),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.salesReport),
        get(PermissionSourceObj.purchaseReport),
        get(PermissionSourceObj.stockReport),
        get(PermissionSourceObj.profitLossReport),
        get(PermissionSourceObj.dashboard),
        get(PermissionSourceObj.shipping),
        get(PermissionSourceObj.delivery),
        get(PermissionSourceObj.role),
        get(PermissionSourceObj.user),

        // Governance permissions REMOVED for Business Admin (Manager)
        // Managers manage operations, not the Board of Directors.
      ].filter(Boolean),
      hierarchyLevel: 90,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.MANAGER, // General Manager
      permissionGroups: [
        get(PermissionSourceObj.product),
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.expense),
        get(PermissionSourceObj.staff),
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
        get(PermissionSourceObj.staff),
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.BUSINESS_ANALYST,
      permissionGroups: [
        get(PermissionSourceObj.report),
        get(PermissionSourceObj.product), // View access usually
      ].filter(Boolean),
      hierarchyLevel: 60,
      roleScope: RoleScope.BUSINESS,
      isDefault: false,
    },
    {
      name: USER_ROLE.BUSINESS_FINANCE,
      permissionGroups: [
        get(PermissionSourceObj.account),
        get(PermissionSourceObj.transaction),
        get(PermissionSourceObj.payment),
        get(PermissionSourceObj.invoice),
        get(PermissionSourceObj.expense),
        get(PermissionSourceObj.report),
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
      name: USER_ROLE.OUTLET_MANAGER,
      permissionGroups: [
        get(PermissionSourceObj.order),
        get(PermissionSourceObj.inventory),
        get(PermissionSourceObj.customer),
        get(PermissionSourceObj.report), // Outlet specific report
        get(PermissionSourceObj.staff), // Manage outlet staff
        get(PermissionSourceObj.storefront),
      ].filter(Boolean),
      hierarchyLevel: 45, // Higher than Store Keeper (40)
      roleScope: RoleScope.OUTLET,
      isDefault: false,
    },
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
      limits: {
        ...DEFAULT_LIMITS,
        financial: { ...DEFAULT_LIMITS.financial, maxDiscountPercent: 5, maxRefundAmount: 500 } // POS Constraint Example
      }
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
        get(PermissionSourceObj.attendance),
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
            limits: cfg.limits || DEFAULT_LIMITS
          },
          $setOnInsert: {
            createdBy: SYSTEM_USER_ID,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      const result = await Role.bulkWrite(bulkOps as any, session ? { session } : {});
      console.log(`✅ Roles synced: ${result.upsertedCount} created, ${result.modifiedCount} updated.`);
    }
  } catch (error) {
    console.error("❌ Failed to seed roles atomically:", error);
    throw error;
  }

  console.log("--- Seeder finished successfully ---");
}
