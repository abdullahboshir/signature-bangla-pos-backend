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

    const businessUnitId = req.headers['x-business-unit-id'] as string;
    const companyHeaderId = req.headers['x-company-id'] as string;
    let effectiveRoleNames: string[] = [];

    // Identify active company for scope inheritance
    // Strategy: Use x-company-id header if present, otherwise derive from Business Unit
    let activeCompanyId: string | null = companyHeaderId || null;

    if (!activeCompanyId && businessUnitId && Array.isArray(isUserExists.businessAccess)) {
      // Find ANY assignment that mentions this business unit to get its company context
      // (This handles cases where the user has COMPANY or GLOBAL scope but is entering a specific BU)
      const buFound = isUserExists.businessAccess.find((a: any) => {
        if (!a.businessUnit) return false;
        const b = a.businessUnit;
        const bId = b._id?.toString() || b.id || b.toString();
        const bSlug = b.slug;
        return bId === businessUnitId || bSlug === businessUnitId;
      });

      if (buFound && buFound.company) {
        activeCompanyId = (buFound.company._id || buFound.company.id || buFound.company).toString();
      }
    }

    // Fallback: If still no company but we have a BU context, fetch BU from DB to find parent company
    if (!activeCompanyId && businessUnitId) {
      let bu;
      if (mongoose.Types.ObjectId.isValid(businessUnitId)) {
        bu = await BusinessUnit.findById(businessUnitId).lean();
      } else {
        bu = await BusinessUnit.findOne({ slug: businessUnitId }).lean();
      }

      if (bu && bu.company) {
        activeCompanyId = bu.company.toString();
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

          // COMPANY scope applies if it matches the active company (via header or BU inheritance)
          if (a.scope === 'COMPANY' && activeCompanyId && (a.company?._id?.toString() === activeCompanyId || a.company?.id === activeCompanyId || a.company?.toString() === activeCompanyId)) {
            include = true;
          }

          // BUSINESS scope applies if it matches explicitly
          if (a.scope === 'BUSINESS' && businessUnitId && (a.businessUnit?._id?.toString() === businessUnitId || a.businessUnit?.id === businessUnitId)) {
            include = true;
          }

          // Union Context Fallback: If no specific scope ID is provided (e.g., on /auth/me), include EVERYTHING for the user session.
          if (!businessUnitId && !companyHeaderId) include = true;

          if (include && a.role) {
            effectiveRoleNames.push(a.role.name);
          }
        });
      }
    }

    // Aggregate Permissions using PermissionService (Handles caching & hierarchy)
    const authContext = await permissionService.getAuthorizationContext(
      isUserExists as any,
      (businessUnitId || activeCompanyId) ? { businessUnitId, companyId: activeCompanyId || undefined } : undefined
    );

    // 3. Validate against Required Roles
    if (requiredRoles.length > 0) {
      if (!isUserExists.isSuperAdmin) {
        // Unique names
        effectiveRoleNames = [...new Set(effectiveRoleNames)];

        const hasRequiredRole = requiredRoles.some(reqRole => effectiveRoleNames.includes(reqRole));
        if (!hasRequiredRole) {
          // console.error("AUTH ERROR: Access Denied");
          // console.error("User ID:", isUserExists._id);
          // console.error("Requested BU ID (Header):", businessUnitId);
          // console.error("Effective Roles:", effectiveRoleNames);
          // console.error("Required Roles:", requiredRoles);
          // console.error("User Business Access:", JSON.stringify(isUserExists.businessAccess, null, 2));

          throw new AppError(status.FORBIDDEN, `Access Denied. You do not have permission for this context.`);
        }
      }
    }


    // Attach user info to request
    const uniqueBusinessUnits = new Map();
    const uniqueCompanies = new Map();
    const uniqueOutlets = new Map();
    const companyModules = new Map();

    if (Array.isArray(isUserExists.businessAccess)) {
      isUserExists.businessAccess.forEach((a: any) => {
        if (a.businessUnit) uniqueBusinessUnits.set(a.businessUnit._id.toString(), a.businessUnit);
        if (a.company) {
          uniqueCompanies.set(a.company._id.toString(), a.company._id.toString()); // Store ID string
          if (a.company.activeModules) {
            companyModules.set(a.company._id.toString(), a.company.activeModules);
          }
        }
        if (a.outlet) uniqueOutlets.set(a.outlet._id.toString(), a.outlet._id.toString()); // Store outlet ID
        // If Business Unit implies a Company, we should ideally fetch it too, but for strict ACL we rely on direct 'company' scope assignment or BU->Company link
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
      companies: Array.from(uniqueCompanies.values()), // Added companies list
      outlets: Array.from(uniqueOutlets.values()), // Added outlets list
      companyModules: Object.fromEntries(companyModules), // Injected Module Config
      ...(isUserExists.branches !== undefined && { branches: isUserExists.branches }),
      ...(isUserExists.vendorId !== undefined && { vendorId: isUserExists.vendorId }),
      ...(isUserExists.region !== undefined && { region: isUserExists.region }),
      iat
    } as JwtPayload;

    next();
  });
};

export default auth;


