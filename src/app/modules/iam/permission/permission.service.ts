import client from '@shared/config/redis.config.ts';
import { buildUserPermissionsKey } from '@core/utils/cacheKeys.ts';
import type { IUser } from '../user/user.interface.js';
import type {
  IPermission,
  IPermissionCondition,
  IPermissionContext,
  IPermissionResult,
  IAuthorizationContext,
  ITargetScope,
} from './permission.interface.js';
import { CacheManager as _CacheManager } from "../../../../core/utils/caching/cache-manager.js";
import logger from '@core/utils/logger.ts';
import { Role } from '../role/role.model.ts';
import { Permission } from './permission.model.ts';





const MAX_ROLE_HIERARCHY_DEPTH = 15;
const _CACHE_TTL_SECONDS = 600; // 10 minutes
const _ALL_ROLES_CACHE_KEY = 'sys:iam:all-active-roles:v3'; // Bumped to v3 for debugging
const _ALL_ROLES_TTL = 30; // Short TTL for debug

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
    const matching = this.filterPermissionsByScopeAndRules(
      effectivePermissions,
      resource,
      action,
      context
    );

    return this.resolvePermissions(matching, context);
  }

  /* ---------------------------------------------------------------------- */
  /* 2️⃣  PUBLIC API – getUserPermissions (cached)                           */
  /* ---------------------------------------------------------------------- */
  async getUserPermissions(
    user: IUser,
    targetScope?: ITargetScope
  ): Promise<IPermission[]> {
    const context = await this.getAuthorizationContext(user, targetScope);
    return context.permissions;
  }

  /* ---------------------------------------------------------------------- */
  /* 2.2️⃣  PUBLIC API – getUniqueResources (For Frontend Sidebar)              */
  /* ---------------------------------------------------------------------- */
  async getUniqueResources(): Promise<string[]> {
    const resources = await Permission.distinct('resource', { isActive: true });
    return resources.sort();
  }

  /* ---------------------------------------------------------------------- */
  /* 2.5️⃣  PUBLIC API – getAuthorizationContext (Effective Limits & Roles)   */
  /* ---------------------------------------------------------------------- */
  async getAuthorizationContext(
    user: IUser,
    targetScope?: ITargetScope
  ): Promise<IAuthorizationContext> {
    const userId = user.id || (user as any)._id?.toString();
    if (!userId) {
      // Should not happen for authenticated users
      return { permissions: [], maxDataAccess: { products: 0, orders: 0, customers: 0 }, hierarchyLevel: 0, scopeRank: 0, dataScope: 'own' };

    }

    const _cacheKey = (await buildUserPermissionsKey(userId, targetScope)) + ':force_v8';


    // Attempt cache fetch
    const cached = await _CacheManager.get<IAuthorizationContext>(_cacheKey);
    if (cached) {
      return cached;
    }



    // SUPER ADMIN OPTIMIZATION:
    // If user has 'isSuperAdmin' flag set
    const isSuperAdmin = user.isSuperAdmin;

    if (isSuperAdmin) {

      const result = {
        permissions: [{ action: '*', resource: '*', effect: 'allow' } as any],
        hierarchyLevel: 100,
        scopeRank: 100, // Global Scope
        maxDataAccess: { products: 0, orders: 0, customers: 0 }, // 0 = Unlimited
        dataScope: 'global'
      };

      // Cache this lightweight result
      await _CacheManager.set(_cacheKey, result, _CACHE_TTL_SECONDS);
      return result;
    }

    const permissions: IPermission[] = [];
    const permissionMap = new Map<string, IPermission>();

    let maxHierarchy = 0;
    let logicStart: number | undefined;

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
    // Handle new { allow: [], deny: [] } structure
    const dPerms = user.directPermissions;
    if (dPerms) {
      if ('allow' in dPerms && Array.isArray(dPerms.allow)) {
        dPerms.allow.forEach(dp => addPermission(dp));
      }
      if ('deny' in dPerms && Array.isArray(dPerms.deny)) {
        dPerms.deny.forEach(dp => addPermission(dp));
      }
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

    // 1. Collect Global Roles
    const globalRoles = (user as any).globalRoles;
    if (Array.isArray(globalRoles)) {
      globalRoles.forEach((r: any) => {
        const rid = r._id?.toString() || r.toString();
        if (rid) roleIds.add(rid);
      });
    }

    const SCOPE_PRIORITY: Record<string, number> = {
      'global': 4,
      'business': 3, 'businessUnit': 3,
      'outlet': 2,
      'own': 1, 'self': 1
    };
    /* const SCOPE_LEVEL_TO_STRING... (mapped at end) */

    let maxScopeLevel = 1; // Default 'own'

    // 2. Identify active organization for scope inheritance
    // Use organizationId/companyId from targetScope if provided, otherwise derive it from Business Unit
    let activeOrganizationId: string | null = targetScope?.organizationId?.toString() || targetScope?.companyId?.toString() || null;
    const targetBuId = targetScope?.businessUnitId?.toString();

    if (!activeOrganizationId && targetBuId && Array.isArray(user.businessAccess)) {
      const buAccess = user.businessAccess.find((a: any) => {
        if (!a.businessUnit) return false;
        const b = a.businessUnit;
        const bId = b._id?.toString() || b.id || b.toString();
        const bSlug = b.slug;
        return bId === targetBuId || bSlug === targetBuId;
      });
      if (buAccess && (buAccess.organization || buAccess.company)) {
        activeOrganizationId = (buAccess.organization?._id || buAccess.organization?.id || buAccess.company?._id || buAccess.company?.id || buAccess.company || buAccess.organization).toString();
      }
    }

    // 3. Collect Business Access (Scoped Roles)
    if (Array.isArray(user.businessAccess)) {
      user.businessAccess.forEach(assignment => {
        // Normalize status
        const statusMatch = !assignment.status || assignment.status.toUpperCase() === 'ACTIVE';
        if (!statusMatch) return;

        // Check Expiry
        if (assignment.expiresAt) {
          const expiry = new Date(assignment.expiresAt);
          if (!isNaN(expiry.getTime()) && expiry < new Date()) return; // Expired
        }

        // Update Data Scope from Override
        if (assignment.dataScopeOverride) {
          const level = SCOPE_PRIORITY[assignment.dataScopeOverride] || 1;
          if (level > maxScopeLevel) {
            maxScopeLevel = level;
          }
        }

        let includeRole = false;

        const buId = assignment.businessUnit
          ? ((assignment.businessUnit as any)._id || assignment.businessUnit).toString()
          : null;
        const outletId = assignment.outlet
          ? ((assignment.outlet as any)._id || assignment.outlet).toString()
          : null;
        const organizationId = assignment.organization
          ? ((assignment.organization as any)._id || assignment.organization).toString()
          : (assignment.company ? ((assignment.company as any)._id || assignment.company).toString() : null);

        const targetOutletId = targetScope?.outletId?.toString();

        // Scope Inheritance Logic:
        // 1. GLOBAL Scope roles always include
        if (assignment.scope === 'GLOBAL') {
          includeRole = true;
        }
        // 2. ORGANIZATION or COMPANY Scope roles include if they match the active organization
        else if ((assignment.scope === 'ORGANIZATION' || assignment.scope === 'COMPANY') && activeOrganizationId && organizationId === activeOrganizationId) {
          includeRole = true;
        }
        // 3. BUSINESS Scope roles include if they match the target BU
        else if (assignment.scope === 'BUSINESS' && targetBuId && buId === targetBuId) {
          includeRole = true;
        }
        // 4. OUTLET Scope roles include if they match the target Outlet
        else if (assignment.scope === 'OUTLET' && targetOutletId && outletId === targetOutletId) {
          includeRole = true;
        }
        // 5. Fallback: If NO target scope is provided, include ALL roles (Union context)
        else if (!targetScope) {
          includeRole = true;
        }

        if (includeRole) {
          const roleId = ((assignment.role as any).forceId || (assignment.role as any)._id || (assignment.role as any).id || assignment.role).toString();
          roleIds.add(roleId);
        }
      });
    }

    if (roleIds.size > 0) {
      console.time('[AUTH-PERF] Role DB Query');
      // OPTIMIZATION: Use Global Cache for Role Definitions
      let allActiveRoles = await _CacheManager.get<any[]>(_ALL_ROLES_CACHE_KEY);

      if (!allActiveRoles) {


        allActiveRoles = await Role.find({ isActive: true })
          .populate({ path: 'permissions', match: { isActive: true } })
          .populate({
            path: 'permissionGroups',
            match: { isActive: true },
            populate: { path: 'permissions', match: { isActive: true } },
          })
          .lean();
        await _CacheManager.set(_ALL_ROLES_CACHE_KEY, allActiveRoles, _ALL_ROLES_TTL);
      } else {
      }

      console.timeEnd('[AUTH-PERF] Role DB Query');

      logicStart = Date.now();

      // Build Map for O(1) lookup
      const roleMap = new Map<string, any>();
      allActiveRoles.forEach((r: any) => roleMap.set(String(r._id), r));

      const visited = new Set<string>();

      const collect = (targetRoleId: string, depth = 0): void => {
        if (!targetRoleId) return;
        if (visited.has(targetRoleId)) return;
        if (depth > MAX_ROLE_HIERARCHY_DEPTH) {
          logger.warn('Role hierarchy depth exceeded', { targetRoleId, depth });
          return;
        }

        const role = roleMap.get(targetRoleId);
        if (!role) return; // Role might be inactive or deleted

        visited.add(targetRoleId);

        // Update Hierarchy
        if (role.hierarchyLevel && role.hierarchyLevel > maxHierarchy) {
          maxHierarchy = role.hierarchyLevel;
        }

        // Update Data Limits
        updateMaxAccess(role.maxDataAccess);

        // Permissions (Directly assigned to role)
        if (Array.isArray(role.permissions)) {
          role.permissions.forEach((p: any) => {
            // Handle both populated object and ID string
            if (p && typeof p === 'object') addPermission(p);
          });
        }

        // Permission Groups
        if (Array.isArray(role.permissionGroups)) {
          for (const grp of role.permissionGroups) {
            // 1. If group has direct permissions array
            if (Array.isArray(grp.permissions)) {
              grp.permissions.forEach((p: any) => {
                if (p && typeof p === 'object') addPermission(p);
              });
            }
            // 2. If group is just an ID (not populated), we can't extract permissions from it here.
            // Rely on the initial Role.find().populate() which should have populated this.
          }
        }

        // Recurse for Inherited Roles (using the map)
        if (Array.isArray(role.inheritedRoles)) {
          role.inheritedRoles.forEach((ir: any) => {
            const irId = ir._id?.toString() || ir.toString();
            collect(irId, depth + 1);
          });
        }
      };

      // Start Collection
      roleIds.forEach(rid => collect(rid));

      // Performance Audit
      const duration = Date.now() - (logicStart || 0);
      if (duration > 200) {
        logger.warn(`[PERF] Permission Calculation took ${duration}ms`);
      }
    }

    // 3️⃣ Derive Data Scope from Permissions (if higher than override)
    permissions.forEach(p => {
      if (p.scope) {
        const level = SCOPE_PRIORITY[p.scope] || 0;
        if (level > maxScopeLevel) {
          maxScopeLevel = level;
        }
      }
    });

    const SCOPE_LEVEL_TO_STRING: Record<number, string> = {
      4: 'global',
      3: 'business',
      2: 'outlet',
      1: 'own'
    };
    const finalDataScope = SCOPE_LEVEL_TO_STRING[maxScopeLevel] || 'own';


    const finalLimits = {
      products: maxAccess.products === -1 ? 0 : maxAccess.products,
      orders: maxAccess.orders === -1 ? 0 : maxAccess.orders,
      customers: maxAccess.customers === -1 ? 0 : maxAccess.customers,
    };

    const result = {
      permissions,
      hierarchyLevel: maxHierarchy,
      maxDataAccess: finalLimits,
      dataScope: finalDataScope,
      scopeRank: maxScopeLevel > 100 ? 100 : (maxScopeLevel < 0 ? 0 : maxScopeLevel * 20) // Approximation if exact map missing, or fix below
    };

    // Fix ScopeRank mapping based on dataScope string
    const SCOPE_RANK_MAP: Record<string, number> = {
      'global': 100,
      'business': 80,
      'warehouse': 60,
      'outlet': 50,
      'department': 40,
      'staff': 20,
      'self': 10,
      'own': 10
    };
    result.scopeRank = SCOPE_RANK_MAP[finalDataScope] || 10;


    // Cache the result
    await _CacheManager.set(_cacheKey, result, _CACHE_TTL_SECONDS);



    return result;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    if (!client.isOpen) return;
    const pattern = `permissions*:user:${userId}:scope:*`;

    try {
      let cursor: any = 0;
      do {
        const reply = await client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = reply.cursor;
        const keys = reply.keys;
        if (keys.length > 0) {
          await client.del(keys);
        }
      } while (String(cursor) !== '0');
      logger.info(`[AUTH-PERF] Invalidated cache for user ${userId}`);
    } catch (error) {
      logger.error(`[AUTH-PERF] Failed to invalidate cache for user ${userId}`, error as any);
    }
  }



  /* ---------------------------------------------------------------------- */
  /* 3️⃣  PRIVATE helpers – matching, condition evaluation, resolution        */
  /* ---------------------------------------------------------------------- */

  /**
   * Filter and Match permissions based on:
   * 1. Resource & Action match
   * 2. Golden Rules (Platform ≠ Business)
   * 3. ScopeRank Restrictions
   * 4. Conditions
   */
  private filterPermissionsByScopeAndRules(
    permissions: IPermission[],
    resource: string,
    action: string,
    context: IPermissionContext,
  ): IPermission[] {

    return permissions.filter((p: any) => {
      if (!p.isActive) return false;
      if (p.resource !== resource && p.resource !== '*') return false; // Support wildcard resource
      if (p.action !== action && p.action !== '*') return false;       // Support wildcard action


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
