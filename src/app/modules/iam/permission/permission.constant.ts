import type z from "zod";
import {
  PermissionActionTypeSchema,
  PermissionEffectSchema,
  PermissionResolverSchema,
  PermissionScopeSchema,
  ResourceTypeSchema,
  ConditionOperatorSchema,
} from "./permission.validation.js";

/* ------------------------------------------------------------------
 * 1️⃣ RESOURCE TYPES (UNCHANGED – only ordered logically)
 * ------------------------------------------------------------------ */

export const PermissionResourceType = [
  // Core Commerce
  "product",
  "category",
  "brand",
  "attribute",
  "attributeGroup",
  "unit",
  "tax",

  // Sales & Orders
  "order",
  "quotation",
  "invoice",
  "return",
  "review",
  "coupon",
  "promotion",
  "abandonedCart",

  // Customers & Users
  "customer",
  "user",
  "role",
  "wishlist",
  "cart",

  // Inventory & Supply
  "inventory",
  "warehouse",
  "purchase",
  "supplier",
  "vendor",
  "adjustment",
  "transfer",

  // Outlet / POS
  "outlet",
  "storefront",
  "terminal",
  "cashRegister",

  // Finance
  "payment",
  "expense",
  "expenseCategory",

  // System & Platform (New)
  "businessUnit",
  "system",
  "setting",
  "backup",
  "analytics",
  "auditLog",
  "budget",
  "account",
  "transaction",
  "settlement",
  "payout",
  "reconciliation",

  // Logistics
  "shipping",
  "courier",
  "delivery",
  "parcel",
  "driver",
  "vehicle",
  "track",
  "dispatch",
  "zone",

  // Reports & Analytics
  "report",
  "analytics",
  "salesReport",
  "purchaseReport",
  "stockReport",
  "profitLossReport",
  "dashboard",

  // HRM
  "staff",
  "attendance",
  "leave",
  "payroll",
  "department",
  "designation",
  "asset",

  // Marketing & Growth
  "affiliate",
  "adCampaign",
  "loyalty",
  "subscription",
  "audience",
  "pixel",
  "event",
  "landingPage",
  "seo",

  // Communication
  "notification",
  "chat",
  "emailTemplate",
  "smsTemplate",

  // Automation & Risk
  "automation",
  "workflow",
  "fraudDetection",
  "riskRule",
  "riskProfile",

  // System / Platform
  "system",
  "auditLog",
  "backup",
  "apiKey",
  "webhook",
  "theme",
  "plugin",
  "language",
  "currency",
  "zone",
  "blacklist",

  // Governance
  "shareholder",
  "meeting",
  "voting",
  "compliance",
  "license",
] as const;

/* ------------------------------------------------------------------
 * 2️⃣ ACTION TYPES (VALID & SAFE)
 * ------------------------------------------------------------------ */

export const PermissionActionType = [
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "reject",
  "manage",
  "view",
  "assign",
  "publish",
  "unpublish",
  "cancel",
  "verify",
  "export",
  "import",
  "download",
  "print",
  "ship",
  "dispatch",
  "refund",
  "track",
  "sync",
  "schedule",
  "reply",
  "block",
  "restrict",
  "adjust",
  "escalate",
] as const;

/* ------------------------------------------------------------------
 * 3️⃣ SCOPES (🔥 FIXED – NO OPERATORS HERE)
 * ------------------------------------------------------------------ */

export const PermissionScope = [
  "global",        // system-level
  "company",       // tenant/group level
  "business",      // business-wide
  "vendor",
  "outlet",
  "branch",
  "warehouse",
  "department",
  "team",
  "category",
  "region",
  "channel",
  "segment",
  "self",          // own data only
] as const;

/* ------------------------------------------------------------------
 * 4️⃣ EFFECT
 * ------------------------------------------------------------------ */

export const PermissionEffect = ["allow", "deny"] as const;

/* ------------------------------------------------------------------
 * 5️⃣ RESOLUTION STRATEGY
 * ------------------------------------------------------------------ */

export const PermissionResolveStrategy = [
  "first-match",     // fast, deterministic
  "most-specific",   // scope-aware
  "priority-based",  // role/group priority
  "cumulative",      // additive (super admin)
] as const;

/* ------------------------------------------------------------------
 * 6️⃣ CONDITION OPERATORS (ONLY HERE)
 * ------------------------------------------------------------------ */

export const PermissionConditionOperator = [
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "not-in",
  "contains",
  "starts-with",
  "ends-with",
  "between",
  "regex",
  "like",
] as const;

/* ------------------------------------------------------------------
 * 7️⃣ TYPESCRIPT TYPES
 * ------------------------------------------------------------------ */

export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ActionType = z.infer<typeof PermissionActionTypeSchema>;
export type PermissionScopeType = z.infer<typeof PermissionScopeSchema>;
export type PermissionEffectType = z.infer<typeof PermissionEffectSchema>;
export type ResolveStrategy = z.infer<typeof PermissionResolverSchema>;
export type PermissionConditionOperatorType =
  z.infer<typeof ConditionOperatorSchema>;

/* ------------------------------------------------------------------
 * 8️⃣ ENUM OBJECTS (SAFE FOR RUNTIME USE)
 * ------------------------------------------------------------------ */

export const PermissionSourceObj = PermissionResourceType.reduce(
  (acc: any, resource) => {
    acc[resource] = resource;
    return acc;
  },
  {} as Record<ResourceType, ResourceType>
);

export const PermissionActionObj = PermissionActionType.reduce(
  (acc: any, action) => {
    acc[action] = action;
    return acc;
  },
  {} as Record<ActionType, ActionType>
);

/* ------------------------------------------------------------------
 * 9️⃣ 🔒 SCOPE RANK (BACKEND ENFORCEMENT – MUST USE)
 * ------------------------------------------------------------------ */

export const ScopeRank: any = {
  global: 100,
  company: 95, // Tenant Level
  business: 90,
  vendor: 80,
  branch: 70,
  outlet: 60,
  warehouse: 55,
  department: 50,
  team: 40,
  category: 30,
  region: 20,
  channel: 15,
  segment: 10,
  self: 1,
};
