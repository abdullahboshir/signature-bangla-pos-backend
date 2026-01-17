import type { NextFunction } from "express"



import config from "@shared/config/app.config.ts"
import status from "http-status"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"
import { User } from "@app/modules/iam/user/user.model.ts"
import { UserBusinessAccess } from "@app/modules/iam/user-business-access/user-business-access.model.ts"
import mongoose from "mongoose"
import { verifyToken } from "@app/modules/iam/auth/auth.utils.ts"
import AppError from "@shared/errors/app-error.ts"
import catchAsync from "@core/utils/catchAsync.ts"
import { ContextService } from "@core/services/context.service.js"
import type { ScopeLevel } from "@core/services/context.service.js"
import { permissionService } from "@app/modules/iam/permission/permission.service.ts"
import { BusinessUnit } from "@app/modules/platform/index.ts"





// Enhanced auth middleware with RBAC support
const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
    }

    let parts = authHeader?.split(" ") ?? []

    if (parts.length !== 1 && parts.length !== 2) {
      throw new AppError(status.UNAUTHORIZED, "Invalid token format");
    }

    let token: string | undefined = '';


    if (parts.length === 1) {
      token = parts[0]
    } else if (parts.length === 2) {
      token = parts[1];
    }


    if (!token) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
    }

    const decoded = verifyToken(token, config.jwt_access_secret as string);
    const { email, iat } = decoded;


    // Get user with populated roles
    const isUserExists = await User.isUserExists(email);

    if (!isUserExists) {
      throw new AppError(status.NOT_FOUND, 'User is not found');
    }

    // FALLBACK: If businessAccess is empty and ID has suffix, fetch manually using prefix
    if (!isUserExists.businessAccess || isUserExists.businessAccess.length === 0) {
      const userIdStr = isUserExists._id?.toString() || "";
      if (userIdStr.includes('-')) {
        const prefix = userIdStr.split('-')[0];
        if (prefix && mongoose.Types.ObjectId.isValid(prefix)) {
          const manualAccess = await UserBusinessAccess.find({
            user: new mongoose.Types.ObjectId(prefix as string),
            status: 'ACTIVE'
          }).populate([
            { path: 'role', select: 'name title isSystemRole' },
            { path: 'businessUnit', select: 'name id slug' },
            { path: 'outlet', select: 'name _id' },
            { path: 'company', select: 'name id slug activeModules' }
          ]).lean();

          if (manualAccess.length > 0) {
            (isUserExists as any).businessAccess = manualAccess;
          }
        }
      }
    }

    const isDeleted = isUserExists.isDeleted;
    if (isDeleted) {
      throw new AppError(status.FORBIDDEN, 'This user is deleted');
    }

    const userStatus = isUserExists.status;
    if (userStatus === 'blocked') {
      throw new AppError(status.FORBIDDEN, 'This user is blocked');
    }

    if (userStatus === 'inactive') {
      throw new AppError(status.FORBIDDEN, 'This user is inactive');
    }

    if (
      isUserExists?.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        isUserExists.passwordChangedAt,
        iat as number,
      )
    ) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized - password changed');
    }



    // ========================================================================
    // SCOPED PERMISSION & ROLE VALIDATION
    // ========================================================================

    // ========================================================================
    // SCOPED PERMISSION & ROLE VALIDATION
    // ========================================================================

    let businessUnitId = req.headers['x-business-unit-id'] as string;
    let organizationHeaderId = (req.headers['x-organization-id'] || req.headers['x-company-id']) as string;
    let outletId = req.headers['x-outlet-id'] as string;
    let effectiveRoleNames: string[] = [];

    let activeOrganizationId: string | null = organizationHeaderId || null;

    if (!activeOrganizationId && businessUnitId && Array.isArray(isUserExists.businessAccess)) {
   
      const buFound = isUserExists.businessAccess.find((a: any) => {
        if (!a.businessUnit) return false;
        const b = a.businessUnit;
        const bId = b._id?.toString() || b.id || b.toString();
        const bSlug = b.slug;
        return bId === businessUnitId || bSlug === businessUnitId;
      });

      if (buFound && (buFound.organization || buFound.company)) {
        activeOrganizationId = (buFound.organization?._id || buFound.organization?.id || buFound.company?._id || buFound.company?.id || buFound.company || buFound.organization).toString();
      }
    }

    // Fallback: If still no organization but we have a BU context, fetch BU from DB to find parent organization
    if (!activeOrganizationId && businessUnitId) {
      let bu;
      if (mongoose.Types.ObjectId.isValid(businessUnitId)) {
        bu = await BusinessUnit.findById(businessUnitId).lean();
      } else {
        bu = await BusinessUnit.findOne({ slug: businessUnitId }).lean();
      }

      if (bu && (bu.organization || bu.organization)) {
        activeOrganizationId = (bu.organization || bu.organization).toString();
      }
    }

    // Fallback: Resolve parents from Outlet if needed
    if (outletId && outletId !== 'new' && mongoose.Types.ObjectId.isValid(outletId) && (!activeOrganizationId || !businessUnitId)) {
      const OutletModel = mongoose.models['Outlet'] || mongoose.model('Outlet');
      // Use any for safe populate access without direct type import
      const outlet = await OutletModel.findById(outletId).populate(['businessUnit', 'organization']).lean() as any;

      if (outlet) {
        if (outlet.businessUnit) {
          const bu = outlet.businessUnit;
          if (!businessUnitId) businessUnitId = (bu._id || bu.id).toString();
          if (!activeOrganizationId && (bu.organization || bu.company)) {
            activeOrganizationId = (bu.organization || bu.company).toString();
          }
        }
      }
    }

    // 🛡️ CONTEXT REVALIDATION: Backend never trusts UI
    if (!isUserExists.isSuperAdmin) {
      const authorizedAccess = isUserExists.businessAccess || [];

      if (activeOrganizationId) {
        const hasOrganizationAccess = authorizedAccess.some((a: any) =>
          a.organization?._id?.toString() === activeOrganizationId ||
          a.company?._id?.toString() === activeOrganizationId ||
          a.scope === 'GLOBAL'
        );
        if (!hasOrganizationAccess) {
          ContextService.logSecurityAlert({
            type: 'CONTEXT_HIJACKING',
            severity: 'CRITICAL',
            action: 'ACCESS_REVALIDATION',
            details: `Unauthorized attempt to access Organization: ${activeOrganizationId}`,
            request: req
          });
          throw new AppError(status.FORBIDDEN, `Access Denied: You do not have access to organization ${activeOrganizationId}`);
        }
      }

      if (businessUnitId) {
        const hasBUAccess = authorizedAccess.some((a: any) =>
          (a.businessUnit?._id?.toString() === businessUnitId || a.businessUnit?.slug === businessUnitId) ||
          (a.scope === 'ORGANIZATION' && activeOrganizationId && (a.organization?._id?.toString() === activeOrganizationId || a.organization?.toString() === activeOrganizationId)) ||
          (a.scope === 'COMPANY' && activeOrganizationId && (a.company?._id?.toString() === activeOrganizationId || a.company?.toString() === activeOrganizationId)) ||
          a.scope === 'GLOBAL'
        );
        if (!hasBUAccess) {
          ContextService.logSecurityAlert({
            type: 'CONTEXT_HIJACKING',
            severity: 'HIGH',
            action: 'CONTEXT_SANITIZATION',
            details: `Unauthorized/Stale Business Unit context ignored: ${businessUnitId}`,
            request: req
          });
          // ⚠️ Soft Fail: Strip the invalid context instead of blocking login/app load
          businessUnitId = undefined as any;
        }
      }

      if (outletId) {
        const hasOutletAccess = authorizedAccess.some((a: any) =>
          a.outlet?._id?.toString() === outletId ||
          (a.scope === 'BUSINESS' && businessUnitId && (a.businessUnit?._id?.toString() === businessUnitId)) ||
          (a.scope === 'ORGANIZATION' && activeOrganizationId && (a.organization?._id?.toString() === activeOrganizationId)) ||
          (a.scope === 'COMPANY' && activeOrganizationId && (a.company?._id?.toString() === activeOrganizationId)) ||
          a.scope === 'GLOBAL'
        );
        if (!hasOutletAccess) {
          ContextService.logSecurityAlert({
            type: 'CONTEXT_HIJACKING',
            severity: 'HIGH',
            action: 'CONTEXT_SANITIZATION',
            details: `Unauthorized/Stale Outlet context ignored: ${outletId}`,
            request: req
          });
          // ⚠️ Soft Fail: Strip the invalid context instead of blocking login/app load
          outletId = undefined as any;
        }
      }
    }

    // 1. Add Global Roles
    if (Array.isArray(isUserExists.globalRoles)) {
      isUserExists.globalRoles.forEach((r: any) => effectiveRoleNames.push(r.name));
    }

    if (isUserExists.isSuperAdmin) {
      // Super Admin has all access
      effectiveRoleNames = ['super-admin', 'admin', ...requiredRoles];
    } else {
      // 2. Aggregate Roles from all relevant scopes
      if (Array.isArray(isUserExists.businessAccess)) {
        isUserExists.businessAccess.forEach((a: any) => {
          // Normalize status
          const statusMatch = !a.status || a.status.toUpperCase() === 'ACTIVE';
          if (!statusMatch) return;

          let include = false;

          // GLOBAL scope always applies
          if (a.scope === 'GLOBAL') include = true;

          // ORGANIZATION or COMPANY scope applies if it matches the active organization
          if ((a.scope === 'ORGANIZATION' || a.scope === 'COMPANY') && activeOrganizationId && 
              (a.organization?._id?.toString() === activeOrganizationId || a.organization?.id === activeOrganizationId || a.organization?.toString() === activeOrganizationId ||
               a.company?._id?.toString() === activeOrganizationId || a.company?.id === activeOrganizationId || a.company?.toString() === activeOrganizationId)) {
            include = true;
          }

          // BUSINESS scope applies if it matches explicitly
          if (a.scope === 'BUSINESS' && businessUnitId && (a.businessUnit?._id?.toString() === businessUnitId || a.businessUnit?.id === businessUnitId)) {
            include = true;
          }

          // Union Context Fallback: If no specific scope ID is provided (e.g., on /auth/me), include EVERYTHING for the user session.
          if (!businessUnitId && !organizationHeaderId) include = true;

          if (include && a.role) {
            effectiveRoleNames.push(a.role.name);
          }
        });
      }
    }

    // Aggregate Permissions using PermissionService (Handles caching & hierarchy)
    const authContext = await permissionService.getAuthorizationContext(
      isUserExists as any,
      (businessUnitId || activeOrganizationId) ? { businessUnitId, organizationId: activeOrganizationId || undefined } : undefined
    );

    // 3. Validate against Required Roles
    if (requiredRoles.length > 0) {
      if (!isUserExists.isSuperAdmin) {
        // Unique names
        effectiveRoleNames = [...new Set(effectiveRoleNames)];

        // 👑 ORGANIZATION OWNER BYPASS: If user is an organization owner, they have full access to their context
        const isOrganizationOwner = effectiveRoleNames.includes('organization-owner') || effectiveRoleNames.includes('company-owner');

        const hasRequiredRole = isOrganizationOwner || requiredRoles.some(reqRole => effectiveRoleNames.includes(reqRole));
        if (!hasRequiredRole) {
          throw new AppError(status.FORBIDDEN, `Access Denied. You do not have permission for this context.`);
        }
      }
    }


    // Attach user info to request
    const uniqueBusinessUnits = new Map();
    const uniqueOrganizations = new Map();
    const uniqueOutlets = new Map();
    const organizationModules = new Map();

    if (Array.isArray(isUserExists.businessAccess)) {
      isUserExists.businessAccess.forEach((a: any) => {
        if (a.businessUnit) uniqueBusinessUnits.set(a.businessUnit._id.toString(), a.businessUnit);
        if (a.organization || a.company) {
          const org = a.organization || a.company;
          uniqueOrganizations.set(org._id.toString(), org._id.toString()); // Store ID string
          if (org.activeModules) {
            organizationModules.set(org._id.toString(), org.activeModules);
          }
        }
        if (a.outlet) uniqueOutlets.set(a.outlet._id.toString(), a.outlet._id.toString()); // Store outlet ID
      });
    }

    req.user = {
      ...decoded,
      userId: isUserExists._id?.toString(),
      id: isUserExists.id,
      email: isUserExists.email,
      roleName: effectiveRoleNames, // Injected context-aware roles
      permissions: authContext.permissions, // Populated from PermissionService
      effectivePermissions: authContext.permissions, // For frontend compatibility
      hierarchyLevel: authContext.hierarchyLevel,
      dataScope: authContext.dataScope,
      scopeRank: authContext.scopeRank,
      businessUnits: Array.from(uniqueBusinessUnits.values()),
      organizations: Array.from(uniqueOrganizations.values()), // Added organizations list
      companies: Array.from(uniqueOrganizations.values()), // Backward compatibility
      outlets: Array.from(uniqueOutlets.values()), // Added outlets list
      organizationModules: Object.fromEntries(organizationModules), // Injected Module Config
      ...(isUserExists.branches !== undefined && { branches: isUserExists.branches }),
      ...(isUserExists.vendorId !== undefined && { vendorId: isUserExists.vendorId }),
      ...(isUserExists.region !== undefined && { region: isUserExists.region }),
      iat
    } as JwtPayload;

    // ============================================
    // SET MULTI-TENANCY CONTEXT & DOMAIN
    // ============================================
    let scopeLevel: ScopeLevel = 'PLATFORM';
    let activeDomain: string | undefined = undefined;

    if (!isUserExists.isSuperAdmin) {
      if (outletId) scopeLevel = 'OUTLET';
      else if (businessUnitId) scopeLevel = 'BUSINESS_UNIT';
      else if (activeOrganizationId) scopeLevel = 'ORGANIZATION';

      // 🧬 Resolve Domain for Business/Outlet context
      if (businessUnitId) {
        // Find existing BU object from user's access or fetch it
        const buObj = Array.from(uniqueBusinessUnits.values()).find((b: any) =>
          b._id?.toString() === businessUnitId || b.slug === businessUnitId
        );
        if (buObj) activeDomain = buObj.domain;
        else {
          // If not in accessible list (though we validated above), fetch it for domain
          const fetchedBu = await BusinessUnit.findById(businessUnitId).select('domain').lean();
          if (fetchedBu) activeDomain = fetchedBu.domain;
        }
      }
    }

    ContextService.setContext({
      userId: isUserExists._id?.toString(),
      roleType: effectiveRoleNames[0], // Primary role
      organizationId: activeOrganizationId || undefined,
      companyId: activeOrganizationId || undefined, // Backward compatibility
      businessUnitId: businessUnitId || undefined,
      outletId: outletId || undefined,
      domain: activeDomain,
      scopeLevel
    } as any);

    next();
  });
};

export default auth;


