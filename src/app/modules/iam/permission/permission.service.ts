// src/modules/Permission/permission.service.ts
import { buildUserPermissionsKey } from '@core/utils/cacheKeys.ts';
import type { IUser } from '../user/user.interface.js';
import type {
  IPermission,
  IPermissionCondition,
  IPermissionContext,
  IPermissionResult,
} from './permission.interface.js';
import { CacheManager } from '@core/utils/caching/cache-manager.ts';
import logger from '@core/utils/logger.ts';
import { Role } from '../role/role.model.ts';

export interface IAuthorizationContext {
  permissions: IPermission[];
  maxDataAccess: {
    products: number;
    orders: number;
    customers: number;
  };
  hierarchyLevel: number;
}



const MAX_ROLE_HIERARCHY_DEPTH = 15;
const CACHE_TTL_SECONDS = 3600;

export class PermissionService {
  /* ---------------------------------------------------------------------- */
  /* 1️⃣  PUBLIC API – checkPermission                                        */
  /* ---------------------------------------------------------------------- */
  async checkPermission(
    user: IUser,
    resource: string,
    action: string,
    context: IPermissionContext,
  ): Promise<IPermissionResult> {
    const effectivePermissions = await this.getUserPermissions(user, context.scope);
    const matching = this.findMatchingPermissions(
      effectivePermissions,
      resource,
      action,
      context,
    );
    return this.resolvePermissions(matching, context);
  }

  /* ---------------------------------------------------------------------- */
  /* 2️⃣  PUBLIC API – getUserPermissions (cached)                           */
  /* ---------------------------------------------------------------------- */
  async getUserPermissions(
    user: IUser,
    targetScope?: { businessUnitId?: string; outletId?: string }
  ): Promise<IPermission[]> {
    const context = await this.getAuthorizationContext(user, targetScope);
    return context.permissions;
  }

  /* ---------------------------------------------------------------------- */
  /* 2.5️⃣  PUBLIC API – getAuthorizationContext (Effective Limits & Roles)   */
  /* ---------------------------------------------------------------------- */
  async getAuthorizationContext(
    user: IUser,
    targetScope?: { businessUnitId?: string; outletId?: string }
  ): Promise<IAuthorizationContext> {
    const cacheKey = await buildUserPermissionsKey(user.id);

    // Attempt cache fetch (currently only caching permissions array, strictly we should cache the full context)
    // For now, we will rebuild context or update cache structure later.
    // Let's stick to logic first.

    const permissions: IPermission[] = [];
    const permissionMap = new Map<string, IPermission>();

    let maxHierarchy = 0;

    // Initialize with -1 to indicate "not set". 
    // Logic: 0 = Unlimited (highest priority), otherwise Max Value wins.
    const maxAccess = {
      products: -1,
      orders: -1,
      customers: -1
    };

    const updateMaxAccess = (roleAccess: any) => {
      if (!roleAccess) return;

      const keys: (keyof typeof maxAccess)[] = ['products', 'orders', 'customers'];

      keys.forEach(key => {
        const structuralValue = roleAccess[key];
        // If value is missing/null, ignore
        if (typeof structuralValue !== 'number') return;

        // If current effective limit is already 0 (Unlimited), nothing can override it.
        if (maxAccess[key] === 0) return;

        // If new role grants 0 (Unlimited), it overrides everything.
        if (structuralValue === 0) {
          maxAccess[key] = 0;
          return;
        }

        // Otherwise, take the maximum value (Permissive Wins strategy)
        // If current is -1 (not set), just take the new value.
        maxAccess[key] = Math.max(maxAccess[key], structuralValue);
      });
    };

    const addPermission = (perm: any) => {
      const pid = perm?.id ?? perm?._id?.toString();
      if (!pid) return;
      if (!permissionMap.has(pid)) {
        permissionMap.set(pid, perm);
        permissions.push(perm);
      }
    };

    // ----- direct permissions -----
    if (Array.isArray(user.directPermissions) && user.directPermissions.length) {
      for (const dp of user.directPermissions) addPermission(dp);
    }

    // Helper to build deep populate object for inheritedRoles
    const buildInheritedRolesPopulate = (depth: number): any => {
      if (depth <= 0) return undefined;

      return {
        path: 'inheritedRoles',
        match: { isActive: true },
        populate: [
          { path: 'permissions', match: { isActive: true } },
          { path: 'permissionGroups', match: { isActive: true }, populate: { path: 'permissions', match: { isActive: true } } },
          buildInheritedRolesPopulate(depth - 1)
        ].filter(Boolean)
      };
    };

    // ----- role based permissions -----
    const roleIds = new Set<string>();
    if (Array.isArray(user.roles)) {
      user.roles.forEach((r: any) => {
        const roleId = (typeof r === 'object' && r && (r.id || r._id))
          ? (r.id || r._id).toString()
          : String(r);
        roleIds.add(roleId);
      });
    }
    // Include Scoped Roles (from permissions array)
    if (Array.isArray(user.permissions)) {
      user.permissions.forEach(p => {
        if (!p.role) return;

        // Scope Filtering Logic
        if (targetScope) {
          if (p.scopeType === 'global') {
            // Always include global roles
          } else if (p.scopeType === 'business-unit') {
            // If target scope has no BU ID, we skip BU-specific roles
            if (!targetScope.businessUnitId) return;

            const scopeIdStr = p.scopeId ? String(p.scopeId) : '';
            if (scopeIdStr !== targetScope.businessUnitId) return;

          } else if (p.scopeType === 'outlet') {
            if (!targetScope.outletId) return;

            const scopeIdStr = p.scopeId ? String(p.scopeId) : '';
            if (scopeIdStr !== targetScope.outletId) return;
          }
        } else {
          // If NO target scope (e.g. initial login checks), we might default to:
          // 1. Include everything (Union) - Useful for "What CAN I do anywhere?"
          // 2. Include only Global (Strict) - Safe.
          // Current decision: Union (Include everything).
        }

        const roleId = (typeof p.role === 'object' && p.role && ((p.role as any).id || (p.role as any)._id))
          ? ((p.role as any).id || (p.role as any)._id).toString()
          : String(p.role);

        roleIds.add(roleId);
      });
    }

    if (roleIds.size > 0) {
      const roleDocs = await Role.find({ _id: { $in: Array.from(roleIds) }, isActive: true })
        .populate({ path: 'permissions', match: { isActive: true } })
        .populate({
          path: 'permissionGroups',
          match: { isActive: true },
          populate: { path: 'permissions', match: { isActive: true } },
        })
        .populate(buildInheritedRolesPopulate(5)) // Populate up to 5 levels deep
        .lean();

      const visited = new Set<string>();

      const collect = (role: any, depth = 0): void => {
        if (!role) return;
        const roleId = String(role._id);
        if (visited.has(roleId)) return;
        if (depth > MAX_ROLE_HIERARCHY_DEPTH) {
          logger.warn('Role hierarchy depth exceeded', { roleId, depth });
          return;
        }
        visited.add(roleId);

        // Update Hierarchy
        if (role.hierarchyLevel && role.hierarchyLevel > maxHierarchy) {
          maxHierarchy = role.hierarchyLevel;
        }

        // Update Data Limits
        updateMaxAccess(role.maxDataAccess);

        // Permissions
        if (Array.isArray(role.permissions)) role.permissions.forEach(addPermission);
        if (Array.isArray(role.permissionGroups)) {
          for (const grp of role.permissionGroups) {
            if (Array.isArray(grp.permissions)) grp.permissions.forEach(addPermission);
          }
        }
        if (Array.isArray(role.inheritedRoles)) {
          for (const parent of role.inheritedRoles) collect(parent, depth + 1);
        }
      };

      for (const r of roleDocs) collect(r);
    }

    // Normalize -1 (init) to 0 (default/unlimited fallback logic?)
    // Actually, if a user has NO role with a limit, what should be the default?
    // Safe default: 0 (view nothing) or Unlimited?
    // Usually, specific permissions grant access. Limits constrain volume.
    // If no limit defined, assume 0 (strict) OR Unlimited?
    // Let's settle on: -1 means "Not Set". undefined means 0.
    // If we return 0, application might treat as unlimited.
    // FIX: Normalize -1 to 0 (assume strict if not set, or unlimited?). 
    // Given the UI text "0 = Unlimited", let's ensure we return 0 only if explicitly granted 0.
    // Use 0 as "Unlimited" in the logic above.
    // If maxAccess is -1, it means "No role speicified a limit". 
    // Safer to default to a reasonable limit or 0 (unlimited)? 
    // Let's default to 0 (Unlimited) if no restrictions found, assuming permissions control ACCESS itself.

    const finalLimits = {
      products: maxAccess.products === -1 ? 0 : maxAccess.products,
      orders: maxAccess.orders === -1 ? 0 : maxAccess.orders,
      customers: maxAccess.customers === -1 ? 0 : maxAccess.customers,
    };

    return {
      permissions,
      hierarchyLevel: maxHierarchy,
      maxDataAccess: finalLimits
    };
  }

  /* ---------------------------------------------------------------------- */
  /* 3️⃣  PRIVATE helpers – matching, condition evaluation, resolution        */
  /* ---------------------------------------------------------------------- */
  private findMatchingPermissions(
    permissions: IPermission[],
    resource: string,
    action: string,
    context: IPermissionContext,
  ): IPermission[] {
    return permissions.filter((p) => {
      if (!p.isActive) return false;
      if (p.resource !== resource) return false;
      if (p.action !== action) return false;

      if (Array.isArray(p.conditions) && p.conditions.length) {
        return this.evaluateConditions(p.conditions, context);
      }
      return true;
    });
  }

  private evaluateConditions(
    conditions: IPermissionCondition[],
    context: IPermissionContext,
  ): boolean {
    for (const condition of conditions) {
      const { field, operator, value } = condition;
      const ctxVal = this.getNestedValue(context, field);
      // Ensure operator is treated as string if compareValues expects string, 
      // or cast it if needed. The error suggests 'operator' might be getting inferred as the object itself?
      // No, for-of with destructuring `const {field} of conditions` works if conditions is array of objects.
      // But let's be safe.
      if (!this.compareValues(ctxVal, operator as string, value)) return false;
    }
    return true;
  }

  /** get nested value like `request.user.id` → `user.id` */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((cur, key) => cur?.[key], obj);
  }

  private compareValues(contextValue: any, operator: string, permissionValue: any): boolean {
    switch (operator) {
      case 'eq':
        return contextValue === permissionValue;
      case 'neq':
        return contextValue !== permissionValue;
      case 'gt':
        return contextValue > permissionValue;
      case 'gte':
        return contextValue >= permissionValue;
      case 'lt':
        return contextValue < permissionValue;
      case 'lte':
        return contextValue <= permissionValue;
      case 'in':
        return Array.isArray(permissionValue) && permissionValue.includes(contextValue);
      case 'not-in':
        return Array.isArray(permissionValue) && !permissionValue.includes(contextValue);
      case 'contains':
        return Array.isArray(contextValue) && contextValue.includes(permissionValue);
      default:
        // unknown operator → treat as NOT matching, but log for debugging
        logger.warn('Unsupported permission operator', { operator, contextValue, permissionValue });
        return false;
    }
  }


  private resolvePermissions(
    permissions: IPermission[],
    _context: IPermissionContext,
  ): IPermissionResult {
    if (!permissions.length) {
      logger.debug('No matching permission – default deny');
      return { allowed: false, reason: 'No matching permissions found' };
    }

    // 0️⃣ Sort by Priority (High to Low)
    // If priority is missing, default to 0.
    permissions.sort((a, b) => (b.resolver?.priority ?? 0) - (a.resolver?.priority ?? 0));

    // Consider only the permissions with the HIGHEST priority score.
    // A High Priority ALLOW should override a Low Priority DENY.
    const maxPriority = permissions[0]?.resolver?.priority ?? 0;
    const topPermissions = permissions.filter(p => (p.resolver?.priority ?? 0) === maxPriority);

    // 1️⃣ explicit deny (security‑first WITHIN same priority)
    const deny = topPermissions.find((p) => p.effect === 'deny');
    if (deny) {
      logger.debug('Permission DENIED by explicit deny', { permissionId: deny.id, priority: maxPriority });
      return {
        allowed: false,
        permission: deny,
        reason: `Explicit deny: ${deny.description ?? ''}`,
        resolvedBy: 'explicit-deny',
      };
    }

    // 2️⃣ explicit allow
    const allow = topPermissions.find((p) => p.effect === 'allow');
    if (allow) {
      logger.debug('Permission ALLOWED by explicit allow', { permissionId: allow.id, priority: maxPriority });
      return {
        allowed: true,
        permission: allow,
        attributes: allow.attributes ?? [],
        conditions: allow.conditions ?? [],
        resolvedBy: 'explicit-allow',
      };
    }

    // 3️⃣ default deny
    logger.debug('No explicit allow – default deny');
    return {
      allowed: false,
      reason: 'No allowing permission found (default deny)',
      resolvedBy: 'default-deny',
    };
  }
}

/* -------------------------------------------------------------------------- */
/* 4️⃣  Export singleton – can be replaced with DI container if needed           */
/* -------------------------------------------------------------------------- */
export const permissionService = new PermissionService();
