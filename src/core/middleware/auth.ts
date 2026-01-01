import type { NextFunction } from "express"



import config from "@shared/config/app.config.ts"
import status from "http-status"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"
import { User } from "@app/modules/iam/user/user.model.ts"
import { verifyToken } from "@app/modules/iam/auth/auth.utils.ts"
import AppError from "@shared/errors/app-error.ts"
import catchAsync from "@core/utils/catchAsync.ts"



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
    let effectiveRoleNames: string[] = [];

    // 1. Add Global Roles
    if (Array.isArray(isUserExists.globalRoles)) {
      isUserExists.globalRoles.forEach((r: any) => effectiveRoleNames.push(r.name));
    }

    if (isUserExists.isSuperAdmin) {
      // Super Admin has all access
      effectiveRoleNames = ['super-admin', 'admin', ...requiredRoles];
    } else if (businessUnitId) {
      // 2. Add Business Unit Specific Roles
      if (Array.isArray(isUserExists.businessAccess)) {
        const access = isUserExists.businessAccess.find((a: any) =>
          (a.businessUnit && (a.businessUnit._id.toString() === businessUnitId || a.businessUnit.id === businessUnitId))
        );
        if (access && access.role) {
          effectiveRoleNames.push(access.role.name);
        }
      }
    } else {
      // Fallback or Global Context: We already added globalRoles.
      // If we want to include ALL business accesses when no BU is specified? 
      // Usually NO, we only want global context.
    }

    // 3. Validate against Required Roles
    if (requiredRoles.length > 0) {
      if (!isUserExists.isSuperAdmin) {
        // Unique names
        effectiveRoleNames = [...new Set(effectiveRoleNames)];

        const hasRequiredRole = requiredRoles.some(reqRole => effectiveRoleNames.includes(reqRole));
        if (!hasRequiredRole) {
          throw new AppError(status.FORBIDDEN, `Access Denied. You do not have permission for this context.`);
        }
      }
    }


    // Attach user info to request
    const uniqueBusinessUnits = new Map();
    if (Array.isArray(isUserExists.businessAccess)) {
      isUserExists.businessAccess.forEach((a: any) => {
        if (a.businessUnit) uniqueBusinessUnits.set(a.businessUnit._id.toString(), a.businessUnit);
      });
    }

    req.user = {
      ...decoded,
      userId: isUserExists._id?.toString(),
      id: isUserExists.id,
      email: isUserExists.email,
      roleName: effectiveRoleNames, // Injected context-aware roles
      permissions: [], // TODO: Populate if needed, or rely on PermissionService
      businessUnits: Array.from(uniqueBusinessUnits.values()),
      ...(isUserExists.branches !== undefined && { branches: isUserExists.branches }),
      ...(isUserExists.vendorId !== undefined && { vendorId: isUserExists.vendorId }),
      ...(isUserExists.region !== undefined && { region: isUserExists.region }),
      iat
    } as JwtPayload;

    next();
  });
};

export default auth;


