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
    const effectivePermissions = await this.getUserPermissions(user);
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
  async getUserPermissions(user: IUser): Promise<IPermission[]> {
    const cacheKey = await buildUserPermissionsKey(user.id);

    // ---------- 1️⃣ try cache ----------
    let cached: IPermission[] | undefined = undefined;
    try {
      cached = await CacheManager.get<IPermission[]>(cacheKey);
    } catch (e) {
      logger.warn('Redis read error – fallback to DB', {
        err: e,
        key: cacheKey,
        userId: user.id,
      });
    }
    if (cached) return cached;

    // ---------- 2️⃣ build permissions ----------
    const permissions: IPermission[] = [];
    const permissionMap = new Map<string, IPermission>();

    const addPermission = (perm: any) => {
      // handle ObjectId, plain doc, populated doc
      const pid = perm?.id ?? perm?._id?.toString();
      if (!pid) return;
      if (!permissionMap.has(pid)) {
        permissionMap.set(pid, perm);
        permissions.push(perm);
      }
    };

    // ----- direct permissions (must be populated) -----
    if (Array.isArray(user.directPermissions) && user.directPermissions.length) {
      for (const dp of user.directPermissions) addPermission(dp);
    }

    // ----- role based permissions (with inheritance) -----
    if (Array.isArray(user.roles) && user.roles.length) {
      const roleDocs = await Role.find({ _id: { $in: user.roles }, isActive: true })
        .populate({ path: 'permissions', match: { isActive: true } })
        .populate({
          path: 'permissionGroups',
          match: { isActive: true },
          populate: { path: 'permissions', match: { isActive: true } },
        })
        .populate({
          path: 'inheritedRoles',
          match: { isActive: true },
          populate: {
            path: 'permissions',
            match: { isActive: true },
          },
        })
        .lean(); // plain objects → easier recursion

      const visited = new Set<string>();

      const collect = (role: any, depth = 0): void => {
        if (!role) return;
        const roleId = String(role._id);
        if (visited.has(roleId)) return;           // already processed -> avoid cycle
        if (depth > MAX_ROLE_HIERARCHY_DEPTH) {
          logger.warn('Role hierarchy depth exceeded', { roleId, depth });
          return;
        }
        visited.add(roleId);

        // direct role permissions
        if (Array.isArray(role.permissions)) role.permissions.forEach(addPermission);

        // permissions from groups
        if (Array.isArray(role.permissionGroups)) {
          for (const grp of role.permissionGroups) {
            if (Array.isArray(grp.permissions)) grp.permissions.forEach(addPermission);
          }
        }

        // recurse into inherited roles (already populated by the query)
        if (Array.isArray(role.inheritedRoles)) {
          for (const parent of role.inheritedRoles) collect(parent, depth + 1);
        }
      };

      for (const r of roleDocs) collect(r);
    }

    logger.info('Permission aggregation completed', {
      userId: user.id,
      count: permissions.length,
    });

    // ---------- 3️⃣ cache result ----------
    try {
      await CacheManager.set(cacheKey, permissions, CACHE_TTL_SECONDS);
    } catch (e) {
      logger.warn('Redis set error – continue without caching', {
        err: e,
        key: cacheKey,
        userId: user.id,
      });
    }
    return permissions;
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
    for (const { field, operator, value } of conditions) {
      const ctxVal = this.getNestedValue(context, field);
      if (!this.compareValues(ctxVal, operator, value)) return false;
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

    // 1️⃣ explicit deny (security‑first)
    const deny = permissions.find((p) => p.effect === 'deny');
    if (deny) {
      logger.debug('Permission DENIED by explicit deny', { permissionId: deny.id });
      return {
        allowed: false,
        permission: deny,
        reason: `Explicit deny: ${deny.description ?? ''}`,
        resolvedBy: 'explicit-deny',
      };
    }

    // 2️⃣ explicit allow
    const allow = permissions.find((p) => p.effect === 'allow');
    if (allow) {
      logger.debug('Permission ALLOWED by explicit allow', { permissionId: allow.id });
      return {
        allowed: true,
        permission: allow,
        attributes: allow.attributes ?? [],
        conditions: allow.conditions ?? [],
        resolvedBy: 'explicit-allow',
      };
    }

    // 3️⃣ default deny (should rarely happen because `deny` already handled)
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
