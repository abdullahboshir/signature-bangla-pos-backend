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

    // Check if password changed after JWT issued
    if (isUserExists?.passwordChangedAt) {
      console.log('Auth Debug:', {
        iat: iat,
        passwordChangedAt: isUserExists.passwordChangedAt,
        passwordChangedAtTimestamp: Math.floor(isUserExists.passwordChangedAt.getTime() / 1000),
        isOlder: User.isJWTIssuedBeforePasswordChanged(isUserExists.passwordChangedAt, iat as number)
      });
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

    const businessUnitId = req.headers['x-business-unit-id'] as string;
    let effectiveRoleNames: string[] = [];
    let activeRole: any = null;

    if (isUserExists.isSuperAdmin) {
      // Super Admin has all access
      effectiveRoleNames = ['super-admin', 'admin', ...requiredRoles];
    } else if (businessUnitId) {
      // 1. Check for specific Business Unit permission
      // 1. Check for specific Business Unit permissions AND Global permissions
      const scopedPermissions = isUserExists.permissions?.filter(p =>
        (p.scopeType === 'business-unit' && p.scopeId?.toString() === businessUnitId) ||
        (p.scopeType === 'global') // Global roles apply everywhere
      );

      if (scopedPermissions && scopedPermissions.length > 0) {
        // Collect roles from ALL applicable permissions
        scopedPermissions.forEach(p => {
          if (p.role) {
            effectiveRoleNames.push((p.role as any).name);
          }
        });

        // For activeRole context, strictly speaking we might want the most specific one, 
        // but for now let's just use the first specific one or first global if no specific.
        // Or better, let's just set activeRole to the first found for backward compat, 
        // but rely on effectiveRoleNames for checks.
        activeRole = scopedPermissions.find(p => p.scopeType === 'business-unit') || scopedPermissions[0];
      }

      // Legacy fallback: Include legacy roles as Global roles even in scoped context
      if (isUserExists.roles && isUserExists.roles.length > 0) {
        isUserExists.roles.forEach((r: any) => effectiveRoleNames.push(r.name));
      }
    } else {
      // 2. Fallback: No Business Unit defined (e.g. /me or general routes)
      // Load all global roles or legacy roles for backward compatibility
      const globalPermissions = isUserExists.permissions?.filter(p => p.scopeType === 'global');
      globalPermissions?.forEach(p => {
        if (p.role) effectiveRoleNames.push((p.role as any).name);
      });

      // Legacy fallback
      if (isUserExists.roles && isUserExists.roles.length > 0) {
        isUserExists.roles.forEach((r: any) => effectiveRoleNames.push(r.name));
      }
    }

    // 3. Validate against Required Roles
    if (requiredRoles.length > 0) {
      // If user is super admin, they pass. Otherwise check roles.
      if (!isUserExists.isSuperAdmin) {
        const hasRequiredRole = requiredRoles.some(reqRole => effectiveRoleNames.includes(reqRole));
        if (!hasRequiredRole) {
          throw new AppError(status.FORBIDDEN, `Access Denied. You do not have permission for this Business Unit.`);
        }
      }
    }


    // Attach user info to request
    req.user = {
      ...decoded,
      userId: isUserExists._id?.toString(),
      id: isUserExists.id,
      email: isUserExists.email,
      roleName: effectiveRoleNames, // Injected context-aware roles
      permissions: activeRole?.permissions || [], // Injected context-aware permissions
      businessUnits: isUserExists.businessUnits,
      ...(isUserExists.branches !== undefined && { branches: isUserExists.branches }),
      ...(isUserExists.vendorId !== undefined && { vendorId: isUserExists.vendorId }),
      ...(isUserExists.region !== undefined && { region: isUserExists.region }),
      iat
    } as JwtPayload;

    next();
  });
};

export default auth;


