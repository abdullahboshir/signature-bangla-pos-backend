import type z from "zod";
import type { PermissionActionTypeSchema, PermissionConditionSchema, PermissionEffectSchema, PermissionResolverSchema, PermissionScopeSchema, ResourceTypeSchema } from "./permission.validation.js";

export const PermissionResourceType = [
  "product",
  "order",
  "customer",
  "category",
  "brand",
  "businessUnit",
  "vendor",
  "store",
  "supplier",
  "promotion",
  "content",
  "user",
  "role",
  "payment",
  "shipping",
  "report",
  "analytics",
  "system",
  "inventory",
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
  "seo",
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
] as const;



export const PermissionScope = [
  "global",
  "vendor",
  "store",
  "category",
  "region",
  "businessUnit",
  "team",
  "branch",
  "warehouse",
  "between",
  "regex",
  "like",
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
];

// for typescript types only
export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ActionType = z.infer<typeof PermissionActionTypeSchema>;
export type PermissionScope = z.infer<typeof PermissionScopeSchema>;
export type PermissionEffectType = z.infer<typeof PermissionEffectSchema>;
export type ResolveStrategy = z.infer<typeof PermissionResolverSchema>;
export type PermissionConditionOperatorType = z.infer<typeof PermissionConditionSchema>;



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
