import type { NextFunction } from "express"



import config from "@shared/config/app.config.ts"
import status from "http-status"
import type { Request, Response } from "express"
import type { JwtPayload } from "jsonwebtoken"
import { User } from "@app/modules/iam/user/user.model.ts"
import { Role } from "@app/modules/iam/role/role.model.ts"
import { verifyToken } from "@app/modules/auth/auth.utils.ts"
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

     
        if(parts.length === 1){
          token = parts[0]
        } else if (parts.length === 2){
          token =  parts[1];
        }
    
  
    if (!token) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized!');
    }

    const decoded = verifyToken(token, config.jwt_access_secret as string);
    const { email, role, iat } = decoded;

    
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
    if (
      isUserExists?.passwordChangedAt &&
      User.isJWTIssuedBeforePasswordChanged(
        isUserExists.passwordChangedAt,
        iat as number,
      )
    ) {
      throw new AppError(status.UNAUTHORIZED, 'You are not authorized - password changed');
    }
    
 
    const dbRoles = isUserExists.roles.map((roleInfo: any) => roleInfo.name);
    const isRoleMatched = dbRoles.some((roleName: string) => Array.isArray(role) && role.includes(roleName))
    
    if (!isRoleMatched) {
      throw new AppError(status.FORBIDDEN, 'Role mismatch - user does not have this role');
    }
    
    // Fetch role details (fixed: removed incorrect object syntax)
    const roleDetails = await Role.find({name: {$in: role}});
    
    if (!roleDetails) {
      throw new AppError(status.NOT_FOUND, 'Role not found');
    }
  

    if (!roleDetails.some((role: any) => role.isActive)) {
      throw new AppError(status.FORBIDDEN, 'Role is not active');
    }

    // Check if user has required role
    if (requiredRoles.length > 0) {
      const hasRequiredRole = role.some((role: any) => requiredRoles.includes(role));
    if(!hasRequiredRole) {
      throw new AppError(status.FORBIDDEN, 'User does not have required role');
    }
    }

    // Attach user info to request
    req.user = {
      ...decoded,
      userId: isUserExists._id?.toString(),
      id: isUserExists.id,
      email: isUserExists.email,
      roleName: roleDetails.map((role: any) => role.name),
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


