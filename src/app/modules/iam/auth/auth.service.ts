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

  const isUserExists = await User.findOne({ email })
    .select('+password email status isDeleted needsPasswordChange isSuperAdmin _id id globalRoles businessAccess')
    .populate([
      {
        path: 'globalRoles',
        select: 'name title isSystemRole'
      },
      {
        path: 'businessAccess',
        select: 'role scope businessUnit outlet company status isPrimary',
        populate: [
          { path: 'role', select: 'name title isSystemRole' },
          { path: 'businessUnit', select: 'name id slug' },
          { path: 'outlet', select: 'name _id' },
          { path: 'company', select: 'name id slug activeModules' }
        ]
      }
    ])
    .lean();


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





  const buMap = new Map();
  if (isUserExists.businessAccess) {
    isUserExists.businessAccess.forEach((assign: any) => {
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


  // Calculate Context Information for Frontend Redirection
  let businessAccessInfo: any = {
    primary: null,
    available: []
  };

  if (isUserExists) {
    if (isUserExists.businessAccess && isUserExists.businessAccess.length > 0) {
      // 1. Identify Primary Context
      const primaryAccess = isUserExists.businessAccess.find((a: any) => a.isPrimary) || isUserExists.businessAccess[0];

      if (primaryAccess) {
        businessAccessInfo.primary = {
          businessUnit: primaryAccess.businessUnit ? {
            _id: primaryAccess.businessUnit._id,
            slug: primaryAccess.businessUnit.slug,
            id: primaryAccess.businessUnit.id
          } : null,
          company: primaryAccess.company ? {
            _id: primaryAccess.company._id,
            name: primaryAccess.company.name,
            slug: primaryAccess.company.slug
          } : null,
          scope: primaryAccess.scope,
          outlet: primaryAccess.outlet ? {
            _id: primaryAccess.outlet._id,
            name: primaryAccess.outlet.name
          } : null,
          role: primaryAccess.role?.name
        };
      }

      // 2. Group Available Contexts
      const buMap = new Map();

      isUserExists.businessAccess.forEach((access: any) => {
        // Business Context vs Company Context handling
        const buId = access.businessUnit?._id.toString() || access.company?._id?.toString() || 'none';

        if (!buMap.has(buId)) {
          buMap.set(buId, {
            businessUnit: access.businessUnit ? {
              _id: access.businessUnit._id,
              slug: access.businessUnit.slug,
              id: access.businessUnit.id,
              name: access.businessUnit.name
            } : null,
            company: access.company ? {
              _id: access.company._id,
              name: access.company.name,
              slug: access.company.slug
            } : null,
            scope: access.scope,
            outlets: [],
            outletCount: 0
          });
        }

        const entry = buMap.get(buId);

        if (access.outlet) {
          entry.outlets.push({
            _id: access.outlet._id,
            name: access.outlet.name
          });
          entry.outletCount++;
        }
      });

      businessAccessInfo.available = Array.from(buMap.values());
    }
  }




  // jwtPayload moved below to include context info


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


  // Inject Context Info into JWT Payload
  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    businessUnits,
    status: isUserExists?.status,
    role: allRoles, // Derived from businessAccess
    isSuperAdmin: isUserExists?.isSuperAdmin,
    context: businessAccessInfo
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

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: isUserExists?.needsPasswordChange
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
      select: 'name title isSystemRole'
    },
    {
      path: 'businessAccess',
      select: 'role scope businessUnit outlet status isPrimary dataScopeOverride',
      populate: [
        {
          path: 'role',
          select: 'name title isSystemRole'
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
      select: 'name title isSystemRole' // No nested permissions needed
    },
    {
      path: 'businessAccess',
      select: 'role scope businessUnit outlet company status isPrimary dataScopeOverride',
      populate: [
        {
          path: 'role',
          select: 'name title isSystemRole' // No nested permissions needed 
        },
        { path: 'businessUnit', select: 'name id slug' },
        { path: 'outlet', select: 'name' },
        { path: 'company', select: 'name id slug activeModules' }
      ]
    }
  ]).lean();

  if (res) {
    // 1. Flatten Role Names for simplified UI display/logic check
    const globalRoleNames = (res as any).globalRoles?.map((r: any) => r.name) || [];
    const businessRoleNames = (res as any).businessAccess?.map((acc: any) => acc.role?.name).filter(Boolean) || [];
    (res as any).role = [...new Set([...globalRoleNames, ...businessRoleNames])];

    if ((res as any).role.includes('super-admin')) {
      res.isSuperAdmin = true;
    }

    try {
      // 2. Calculate Authorization Context (Using Cache if available)
      const authContext = await permissionService.getAuthorizationContext(res as any, scope);

      (res as any).maxDataAccess = authContext.maxDataAccess;
      (res as any).hierarchyLevel = authContext.hierarchyLevel;
      (res as any).dataScope = authContext.dataScope;


      const permMap = new Map<string, any[]>();

      authContext.permissions.forEach(p => {
        if (!p.resource || !p.action) return;
        const key = `${p.resource}:${p.action}`;
        if (!permMap.has(key)) permMap.set(key, []);
        permMap.get(key)?.push(p);
      });

      const resolvedPermissions: string[] = [];

      // b. Resolve each group
      permMap.forEach((perms, key) => {
        // Sort by Priority (High to Low)
        perms.sort((a, b) => (b.resolver?.priority ?? 0) - (a.resolver?.priority ?? 0));

        // Take top priority permissions
        const maxPriority = perms[0]?.resolver?.priority ?? 0;
        const topPerms = perms.filter(p => (p.resolver?.priority ?? 0) === maxPriority);

        // Check effects
        const hasDeny = topPerms.some(p => p.effect === 'deny');
        const hasAllow = topPerms.some(p => p.effect === 'allow');

        // Allow if explicit allow exists AND no explicit deny at same specific level
        // (Usually deny overrides allow at same level, or allow overrides if we are permissive. 
        // Standard Service logic: Deny wins at same priority level.)
        if (hasAllow && !hasDeny) {
          resolvedPermissions.push(key);
        }
      });

      (res as any).effectivePermissions = resolvedPermissions;

      // 4. STRIP Heavy Data for Performance
      delete (res as any).directPermissions;
      delete (res as any).permissions; // legacy
      delete (res as any).loginHistory;
      delete (res as any).__v;
      delete (res as any).createdAt;
      delete (res as any).updatedAt;
      delete (res as any).createdBy;
      delete (res as any).updatedBy;
      delete (res as any).password;

      // --- INJECT CONTEXT INFO (Same as Login) ---
      let businessAccessInfo: any = {
        primary: null,
        available: []
      };

      if (res.businessAccess && res.businessAccess.length > 0) {
        // 1. Identify Primary Context
        const primaryAccess = res.businessAccess.find((a: any) => a.isPrimary) || res.businessAccess[0];

        if (primaryAccess) {
          businessAccessInfo.primary = {
            businessUnit: primaryAccess.businessUnit ? {
              _id: primaryAccess.businessUnit._id,
              slug: primaryAccess.businessUnit.slug,
              id: primaryAccess.businessUnit.id
            } : null,
            company: primaryAccess.company ? {
              _id: primaryAccess.company._id,
              name: primaryAccess.company.name,
              slug: primaryAccess.company.slug
            } : null,
            scope: primaryAccess.scope,
            outlet: primaryAccess.outlet ? {
              _id: primaryAccess.outlet._id,
              name: primaryAccess.outlet.name
            } : null,
            role: primaryAccess.role?.name
          };
        }

        // 2. Group Available Contexts
        const buMap = new Map();

        res.businessAccess.forEach((access: any) => {
          const buId = access.businessUnit?._id.toString() || access.company?._id?.toString() || 'none';

          if (!buMap.has(buId)) {
            buMap.set(buId, {
              businessUnit: access.businessUnit ? {
                _id: access.businessUnit._id,
                slug: access.businessUnit.slug,
                id: access.businessUnit.id,
                name: access.businessUnit.name
              } : null,
              company: access.company ? {
                _id: access.company._id,
                name: access.company.name,
                slug: access.company.slug
              } : null,
              scope: access.scope,
              outlets: [],
              outletCount: 0
            });
          }

          const entry = buMap.get(buId);

          if (access.outlet) {
            entry.outlets.push({
              _id: access.outlet._id,
              name: access.outlet.name
            });
            entry.outletCount++;
          }
        });

        businessAccessInfo.available = Array.from(buMap.values());
      }
      (res as any).context = businessAccessInfo;
      // -------------------------------------------

      // CRITICAL OPTIMIZATION: Remove large populated arrays
      // The frontend generally uses 'effectivePermissions' for UI access.
      // If it needs role names, we kept 'role' array of strings.
      // If it needs Business Units list, we might need to keep a summary, but deeper access objects are heavy.
      // We will keep 'businessAccess' BUT strip its nested role permissions.

      if (Array.isArray(res.businessAccess)) {
        res.businessAccess = res.businessAccess.map((acc: any) => ({
          _id: acc._id,
          role: { name: acc.role?.name, isSystemRole: acc.role?.isSystemRole }, // Minimal Role
          businessUnit: acc.businessUnit, // Minimal BU (id, name, slug)
          outlet: acc.outlet,
          status: acc.status,
          isPrimary: acc.isPrimary
        })) as any;
      }

      // Simplify Global Roles instead of deleting
      if (Array.isArray(res.globalRoles)) {
        res.globalRoles = res.globalRoles.map((r: any) => ({
          _id: r._id,
          name: r.name,
          title: r.title,
          isSystemRole: r.isSystemRole
        })) as any;
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
