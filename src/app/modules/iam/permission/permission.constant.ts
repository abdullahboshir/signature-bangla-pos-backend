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

import {
  PermissionResourceType,
  PermissionModule,
  PermissionActionType,
  PermissionScope,
  PermissionEffect,
  PermissionResolveStrategy,
  PermissionConditionOperator
} from "./permission.resource.js";

export {
  PermissionResourceType,
  PermissionModule,
  PermissionActionType,
  PermissionScope,
  PermissionEffect,
  PermissionResolveStrategy,
  PermissionConditionOperator
};

/* ------------------------------------------------------------------
 * 7️⃣ TYPESCRIPT TYPES
 * ------------------------------------------------------------------ */

export type ResourceType = z.infer<typeof ResourceTypeSchema>;
export type ActionType = z.infer<typeof PermissionActionTypeSchema>;
export type PermissionModuleType = (typeof PermissionModule)[number];
export type PermissionScopeType = z.infer<typeof PermissionScopeSchema>;
export type PermissionEffectType = z.infer<typeof PermissionEffectSchema>;
export type ResolveStrategy = z.infer<typeof PermissionResolverSchema>;
export type PermissionConditionOperatorType =
  z.infer<typeof ConditionOperatorSchema>;

/* ------------------------------------------------------------------
 * 8️⃣ ENUM OBJECTS (SAFE FOR RUNTIME USE)
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
 * 8️⃣ ENUM OBJECTS (SAFE FOR RUNTIME USE)
 * ------------------------------------------------------------------ */

// Re-exported from resource file to prevent circular dependency
export { PermissionSourceObj, PermissionActionObj } from "./permission.resource.js";

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
