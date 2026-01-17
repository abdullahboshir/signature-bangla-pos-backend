import type { IPermission, IPermissionContext } from "./permission.interface.js";

/**
 * Utility functions for permission management
 */

/**
 * Check if user has specific permission by resource and action
 */
export function hasPermission(
  permissions: IPermission[],
  resource: string,
  action: string
): boolean {
  return permissions.some(
    (p) => p.resource === resource && p.action === action && p.effect === 'allow' && p.isActive
  );
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  permissions: IPermission[],
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.some(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  permissions: IPermission[],
  checks: Array<{ resource: string; action: string }>
): boolean {
  return checks.every(({ resource, action }) =>
    hasPermission(permissions, resource, action)
  );
}

/**
 * Get all permissions for a specific resource
 */
export function getResourcePermissions(
  permissions: IPermission[],
  resource: string
): IPermission[] {
  return permissions.filter(
    (p) => p.resource === resource && p.isActive
  );
}

/**
 * Check if a permission is denied
 */
export function isDenied(
  permissions: IPermission[],
  resource: string,
  action: string
): boolean {
  return permissions.some(
    (p) => p.resource === resource && p.action === action && p.effect === 'deny' && p.isActive
  );
}

/**
 * Build permission context from request
 */
export function buildContextFromRequest(req: any): IPermissionContext {
  const user = req.user;

  return {
    user: {
      id: user?.id || user?.userId,
      roles: user?.roles || [],
      organizations: user?.organizations || user?.companies || [], // Add organizations/companies to context
      companies: user?.companies || user?.organizations || [], // Maintain backward compatibility
      businessUnits: user?.businessUnits || [],
      outlets: user?.outlets || [], // Add outlets to context
      ...(user?.branches && { branches: user.branches }),
      ...(user?.vendorId && { vendorId: user.vendorId }),
      ...(user?.region && { region: user.region })
    },
    resource: {
      id: req.params.id || req.params.resourceId,
      ownerId: req.body?.ownerId || req.params.userId || req.params.ownerId,
      organizationId: req.body?.organizationId || req.params.organizationId || req.headers?.['x-organization-id'] || req.body?.companyId || req.params.companyId || req.headers?.['x-company-id'], // Support Organization context
      companyId: req.body?.companyId || req.params.companyId || req.headers?.['x-company-id'] || req.body?.organizationId || req.params.organizationId || req.headers?.['x-organization-id'], // Backward compatibility
      businessUnitId: req.body?.businessUnitId || req.params.businessUnitId || req.params['business-unit'], // Add businessUnitId
      outletId: req.body?.outletId || req.params.outletId || req.headers?.['x-outlet-id'], // Add outletId
      vendorId: req.body?.vendorId || req.params.vendorId || user?.vendorId,
      category: req.body?.category || req.params.category || req.query?.category,
      region: req.body?.region || req.params.region || user?.region
    },
    environment: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timeOfDay: new Date().toISOString()
    }
  };
}

/**
 * Filter permissions by scope
 */
export function filterByScope(
  permissions: IPermission[],
  scope: string
): IPermission[] {
  return permissions.filter((p) => p.scope === scope && p.isActive);
}

/**
 * Get unique resources from permissions
 */
export function getUniqueResources(permissions: IPermission[]): string[] {
  return [...new Set(permissions.map((p) => p.resource))];
}

/**
 * Get unique actions for a resource
 */
export function getResourceActions(
  permissions: IPermission[],
  resource: string
): string[] {
  return [
    ...new Set(
      permissions
        .filter((p) => p.resource === resource && p.isActive)
        .map((p) => p.action)
    )
  ];
}

/**
 * Check if permission matches scope criteria
 */
export function matchesScope(
  permission: IPermission,
  context: IPermissionContext
): boolean {
  switch (permission.scope) {
    case 'global':
      return true;

    case 'vendor':
      return context.user.vendorId === context.resource?.vendorId;

    case 'organization':
    case 'company':
      // Check if user has access to this organization
      return (context.user.organizations || context.user.companies)?.some(
        (orgId: string) => orgId === context.resource?.organizationId || orgId === context.resource?.companyId
      ) ?? false;

    case 'business': // Fixed: matches PermissionScope constant
      // Check if user's businessUnits include the resource's businessUnit
      return context.user.businessUnits?.some(
        (bu: any) => {
          const buId = bu?._id?.toString() || bu?.toString();
          return buId === context.resource?.businessUnitId;
        }
      ) ?? false;

    case 'region':
      return context.user.region === context.resource?.region;

    case 'branch':
      return context.user.branches?.some(
        (branch) => context.resource?.region === branch
      ) ?? false;

    case 'outlet':
      // Check if user's outlets include the resource's outlet
      return context.user.outlets?.some(
        (outletId: string) => outletId === context.resource?.outletId
      ) ?? false;

    default:
      return true;
  }
}

/**
 * Group permissions by resource
 */
export function groupByResource(
  permissions: IPermission[]
): Record<string, IPermission[]> {
  return permissions.reduce((acc: any, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, IPermission[]>);
}

/**
 * Create permission summary for logging/debugging
 */
export function createPermissionSummary(permissions: IPermission[]): {
  total: number;
  allowed: number;
  denied: number;
  byResource: Record<string, number>;
  byAction: Record<string, number>;
} {
  const summary = {
    total: permissions.length,
    allowed: permissions.filter((p) => p.effect === 'allow').length,
    denied: permissions.filter((p) => p.effect === 'deny').length,
    byResource: {} as Record<string, number>,
    byAction: {} as Record<string, number>
  };

  permissions.forEach((p) => {
    summary.byResource[p.resource] = (summary.byResource[p.resource] || 0) + 1;
    summary.byAction[p.action] = (summary.byAction[p.action] || 0) + 1;
  });

  return summary;
}
