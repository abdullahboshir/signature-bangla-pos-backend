import type z from "zod";
import { PermissionActionTypeSchema, PermissionEffectSchema, PermissionResolverSchema, PermissionScopeSchema, ResourceTypeSchema, ConditionOperatorSchema } from "./permission.validation.js";

export const PermissionResourceType = [
  "product",
  "order",
  "customer",
  "category",
  "brand",
  "businessUnit",
  "vendor",
  "outlet",
  "supplier",
  "promotion",
  "content",
  "staff",
  "attribute",
  "attributeGroup",
  "unit",
  "tax",
  "warehouse",
  "storefront",
  "purchase",
  "user",
  "role",
  "payment",
  "shipping",
  "report",
  "analytics",
  "system",
  "inventory",
  "quotation",
  "coupon",
  "review",
  "return",
  "ticket",
  "delivery",
  "affiliate",
  "adCampaign",
  "notification",
  "loyalty",
  "subscription",
  "dispute",
  "settlement",
  "payout",
  "chat",
  "fraudDetection",
  "auditLog",
  "attendance",
  "leave",
  "payroll",
  "department",
  "designation",
  "asset",
  "expense",
  "expenseCategory",
  "budget",
  "account",
  "transaction",
  "cashRegister",
  "salesReport",
  "purchaseReport",
  "stockReport",
  "profitLossReport",
  "terminal",
  "currency",
  "language",
  "zone",
  "backup",
  "apiKey",
  "webhook",
  "wishlist",
  "cart",
  "theme",
  "plugin",
  "emailTemplate",
  "smsTemplate",
  "seo",
  "question",
  "courier",
  "parcel",
  "invoice",
  "blacklist",
  "pixel",
  "event",
  "landingPage",
  "adjustment",
  "transfer",
  "abandonedCart",
  "dashboard",
  "reconciliation",
  "riskRule",
  "audience",
  "riskProfile",
  "automation",
  "workflow",
] as const;


export const PermissionActionType = [
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "reject",
  "export",
  "import",
  "manage",
  "view",
  "ship",
  "refund",
  "dispatch",
  "assign",
  "sync",
  "schedule",
  "publish",
  "unpublish",
  "escalate",
  "print",
  "cancel",
  "verify",
  "download",
  "reply",
  "block",
  "restrict",
  "adjust",
  "track",
] as const;



export const PermissionScope = [
  "global",
  "vendor",
  "outlet",
  "category",
  "region",
  "businessUnit",
  "team",
  "branch",
  "warehouse",
  "department", // Added for HRM
  "self",       // Critical for accessing own data
  "between",    // This was misplaced in existing code, but kept if used as a scope? Typically 'between' is an operator.
  "regex",
  "like",
  "channel",
  "segment",
  "ip",
  "device",
];

export const PermissionEffect = ["allow", "deny"];

export const PermissionResolveStrategy = [
  "first-match",
  "most-specific",
  "priority-based",
  "cumulative",
];

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
];

// for typescript types only
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ActionType = z.infer<typeof PermissionActionTypeSchema>;
export type PermissionScope = z.infer<typeof PermissionScopeSchema>;
export type PermissionEffectType = z.infer<typeof PermissionEffectSchema>;
export type ResolveStrategy = z.infer<typeof PermissionResolverSchema>;
export type PermissionConditionOperatorType = z.infer<typeof ConditionOperatorSchema>;



export const PermissionSourceObj = PermissionResourceType.reduce(
  (acc: any, action) => {
    acc[action] = action;
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
