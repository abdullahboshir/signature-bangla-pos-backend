import { createToken, verifyToken } from "./auth.utils.ts";
import { USER_STATUS } from '../user/user.constant.js';
import { User } from '../user/user.model.js';
import "../../platform/organization/business-unit/core/business-unit.model.js";
import "../role/role.model.js";
import "../permission/permission.model.js";
import "../permission-group/permission-group.model.js";
import appConfig from "@shared/config/app.config.ts";
import AppError from "@shared/errors/app-error.ts";
import status from "http-status";
import { PermissionService } from '../permission/permission.service.js';

const permissionService = new PermissionService();

export const loginService = async (email: string, pass: string) => {
  const isUserExists = await User.isUserExists(email);



  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, "User is not found");
  }

  const isDeleted = isUserExists.isDeleted;

  if (isDeleted) {
    throw new AppError(status.FORBIDDEN, "this User is deleted");
  }

  const userStatus = isUserExists.status;

  if (userStatus === USER_STATUS.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "this User is blocked");
  }

  if (!(await User.isPasswordMatched(pass, isUserExists.password as unknown as string))) {
    throw new AppError(status.FORBIDDEN, "password deos not matched");
  }


  const globalRoleNames = isUserExists.globalRoles?.map((r: any) => r.name) || [];
  // businessAccess is a virtual, populated in isUserExists
  const businessRoleNames = isUserExists.businessAccess?.map((assign: any) => assign.role?.name).filter(Boolean) || [];
  const allRoles = [...new Set([...globalRoleNames, ...businessRoleNames])];




  // Extract unique business units from access assignments
  const buMap = new Map();
  if (isUserExists.businessAccess) {
    isUserExists.businessAccess.forEach((assign: any) => {
      // Ensure businessUnit is populated before accessing properties
      if (assign.businessUnit && typeof assign.businessUnit === 'object' && 'name' in assign.businessUnit) {
        buMap.set(assign.businessUnit._id.toString(), {
          _id: assign.businessUnit._id,
          name: assign.businessUnit.name,
          id: assign.businessUnit.id,
          slug: assign.businessUnit.slug
        });
      }
    });
  }
  const businessUnits = Array.from(buMap.values());

  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    businessUnits,
    status: isUserExists?.status,
    role: allRoles, // Derived from businessAccess
    isSuperAdmin: isUserExists?.isSuperAdmin // Explicit flag check
    // Add context to token payload if needed, or keep token light. Keeping token light.
  };

  const accessToken = createToken(
    jwtPayload,
    appConfig.jwt_access_secret as string,
    appConfig.jwt_access_expired_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    appConfig.jwt_refresh_secret as string,
    appConfig.jwt_refresh_expired_in as string
  );

  // console.log('userrrrrrrrrrrrrrrrrrrrrrrrr', isUserExists.businessUnits)


  // const userInfo = {
  //   userId: isUserExists?._id,
  //   id: isUserExists?.id,
  //   email: isUserExists?.email,
  //   status: isUserExists?.status,
  //   role: allRoles, // Array of strings (legacy/simple)
  //   roles: isUserExists.roles, // Array of objects (populated)
  //   permissions: isUserExists.permissions || [], // Scoped permissions

  //   // Authorization Context Injection
  //   maxDataAccess: authContext.maxDataAccess,
  //   hierarchyLevel: authContext.hierarchyLevel,
  //   effectivePermissions: authContext.permissions
  //     .filter(p => p && p.resource && p.action) // Filter out invalid permissions
  //     .map(p => `${p.resource}:${p.action}`),

  //   isSuperAdmin: isUserExists.isSuperAdmin,
  //   businessUnits: businessUnits // sending full object array
  // }

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: isUserExists?.needsPasswordChange,
  };
};

export const refreshTokenAuthService = async (token: string) => {
  if (!token) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized!')
  }

  let decoded;
  try {
    decoded = verifyToken(token, appConfig.jwt_refresh_secret as string)
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError(status.UNAUTHORIZED, 'Refresh token expired!')
    }
    throw new AppError(status.UNAUTHORIZED, 'Invalid refresh token!')
  }

  const { userId, iat } = decoded

  // FIXED: find user by custom userId
  const isUserExists = await User.findOne({ _id: userId }).populate([
    {
      path: 'globalRoles',
      populate: {
        path: 'permissionGroups',
        select: 'permissions resolver',
        populate: { path: 'permissions', select: 'resource action scope effect conditions resolver attributes' }
      }
    },
    {
      path: 'businessAccess',
      select: 'role scope businessUnit outlet status isPrimary dataScopeOverride',
      populate: [
        {
          path: 'role',
          select: 'name title permissionGroups',
          populate: {
            path: 'permissionGroups',
            select: 'permissions resolver',
            populate: { path: 'permissions', select: 'resource action scope effect conditions resolver attributes' }
          }
        },
        { path: 'businessUnit', select: 'name id slug' },
        { path: 'outlet', select: 'name' }
      ]
    }
  ]).lean()


  if (!isUserExists) {
    throw new AppError(status.NOT_FOUND, 'User is not found')
  }

  if (isUserExists.isDeleted) {
    throw new AppError(status.FORBIDDEN, 'This user is deleted')
  }

  if (isUserExists.status === 'blocked') {
    throw new AppError(status.FORBIDDEN, 'This user is blocked')
  }

  if (isUserExists.status === 'inactive') {
    throw new AppError(status.FORBIDDEN, 'This user is inactive')
  }

  if (
    isUserExists.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(
      isUserExists.passwordChangedAt,
      iat as number
    )
  ) {
    throw new AppError(status.UNAUTHORIZED, 'You are not authorized')
  }


  const globalRoleNames = (isUserExists as any).globalRoles?.map((r: any) => r.name) || [];
  const businessRoleNames = (isUserExists as any).businessAccess?.map((acc: any) => acc.role?.name).filter(Boolean) || [];
  const allRoles = [...new Set([...globalRoleNames, ...businessRoleNames])];


  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    role: allRoles,
    status: isUserExists?.status,
    roleIds: allRoles,
    isSuperAdmin: isUserExists.isSuperAdmin
  };



  const accessToken = createToken(
    jwtPayload,
    appConfig.jwt_access_secret as string,
    appConfig.jwt_access_expired_in as string
  )

  return { accessToken }
}


export const authMeService = async (
  userInfo: any,
  scope?: { businessUnitId?: string; outletId?: string }
) => {

  const res = await User.findOne({ _id: userInfo.userId }).populate([
    {
      path: 'globalRoles',
      populate: {
        path: 'permissionGroups',
        select: 'permissions resolver',
        populate: { path: 'permissions', select: 'resource action scope effect conditions resolver attributes' }
      }
    },
    {
      path: 'businessAccess',
      select: 'role scope businessUnit outlet status',
      populate: [
        {
          path: 'role',
          select: 'name title permissionGroups',
          populate: {
            path: 'permissionGroups',
            select: 'permissions resolver',
            populate: { path: 'permissions', select: 'resource action scope effect conditions resolver attributes' }
          }
        },
        { path: 'businessUnit', select: 'name id slug' },
        { path: 'outlet', select: 'name' }
      ]
    }
  ]).lean();

  if (res) {
    const globalRoleNames = (res as any).globalRoles?.map((r: any) => r.name) || [];
    const businessRoleNames = (res as any).businessAccess?.map((acc: any) => acc.role?.name).filter(Boolean) || [];
    (res as any).role = [...new Set([...globalRoleNames, ...businessRoleNames])];


    if ((res as any).role.includes('super-admin')) {
      res.isSuperAdmin = true;
    }

    try {
      const authContext = await permissionService.getAuthorizationContext(res as any, scope);



      (res as any).maxDataAccess = authContext.maxDataAccess;
      (res as any).hierarchyLevel = authContext.hierarchyLevel;
      (res as any).dataScope = authContext.dataScope;

      (res as any).effectivePermissions = authContext.permissions
        .filter(p => p && p.resource && p.action)
        .map(p => ({
          resource: p.resource,
          action: p.action,
          scope: p.scope,
          effect: p.effect
        }));

      delete (res as any).directPermissions;
      delete (res as any).permissions; // legacy
      delete (res as any).loginHistory;
      delete (res as any).__v;
      delete (res as any).createdAt;
      delete (res as any).updatedAt;
      delete (res as any).createdBy;
      delete (res as any).updatedBy;
      delete (res as any).password;


      if (Array.isArray(res.businessAccess)) {
        res.businessAccess.forEach((acc: any) => {
          if (acc.role) {
            delete acc.role.permissions;
            delete acc.role.permissionGroups;
          }
        });
      }

    } catch (e) {
      console.error("Failed to calculate auth context", e);
    }
  }

  return res;
}



export const logoutService = async () => {
  return true;
};
