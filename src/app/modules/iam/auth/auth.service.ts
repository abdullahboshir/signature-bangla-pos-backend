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

  const query = User.findOne({ email });
  (query as any)._bypassContext = true;

  const isUserExists = await query
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
  const companies = [...new Set((isUserExists.businessAccess || []).map((a: any) => a.company?._id?.toString() || a.company?.toString()).filter(Boolean))];


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
            slug: primaryAccess.businessUnit.slug || primaryAccess.businessUnit.id || primaryAccess.businessUnit._id.toString(),
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
        // Business Context vs Organization Context handling
        const buId = access.businessUnit?._id.toString() || access.company?._id?.toString() || 'none';

        if (!buMap.has(buId)) {
          buMap.set(buId, {
            businessUnit: access.businessUnit ? {
              _id: access.businessUnit._id,
              slug: access.businessUnit.slug || access.businessUnit.id || access.businessUnit._id.toString(),
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
    companies,
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
  const query = User.findOne({ _id: userId });
  (query as any)._bypassContext = true;

  const isUserExists = await query.populate([
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
        { path: 'outlet', select: 'name' },
        { path: 'company', select: 'name id slug activeModules' }
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


  const companies = [...new Set(((isUserExists as any).businessAccess || []).map((a: any) => a.company?._id?.toString() || a.company?.toString()).filter(Boolean))];

  const jwtPayload: any = {
    userId: isUserExists?._id,
    id: isUserExists?.id,
    email: isUserExists?.email,
    role: allRoles,
    status: isUserExists?.status,
    roleIds: allRoles,
    companies,
    isSuperAdmin: (isUserExists as any).isSuperAdmin
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

  const query = User.findOne({ _id: userInfo.userId });
  (query as any)._bypassContext = true;

  const res = await query.populate([
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
              slug: primaryAccess.businessUnit.slug || primaryAccess.businessUnit.id || primaryAccess.businessUnit._id.toString(),
              id: primaryAccess.businessUnit.id
            } : null,
            company: primaryAccess.company ? {
              _id: primaryAccess.company._id,
              name: primaryAccess.company.name,
              slug: primaryAccess.company.slug,
              activeModules: primaryAccess.company.activeModules
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
                slug: access.businessUnit.slug || access.businessUnit.id || access.businessUnit._id.toString(),
                id: access.businessUnit.id,
                name: access.businessUnit.name
              } : null,
              company: access.company ? {
                _id: access.company._id,
                name: access.company.name,
                slug: access.company.slug,
                activeModules: access.company.activeModules
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
      (res as any).companies = [...new Set((res.businessAccess || []).map((a: any) => a.company?._id?.toString() || a.company?.toString() || a.company).filter(Boolean))];
      // -------------------------------------------

      // Attach primary company modules at top level for easy frontend access
      if (businessAccessInfo.primary?.company) {
        (res as any).company = businessAccessInfo.primary.company;
      }

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

/**
 * Setup Password Service
 * Used for new Organization Owners to set their initial password via email token
 */
export const setupPasswordService = async (token: string, password: string) => {
  // 1. Find user by setup token
  const query = User.findOne({
    setupPasswordToken: token,
    setupPasswordExpires: { $gt: new Date() }
  });
  (query as any)._bypassContext = true;

  const user = await query.select('+setupPasswordToken +setupPasswordExpires');

  if (!user) {
    throw new AppError(status.BAD_REQUEST, 'Invalid or expired setup token. Please contact support for a new invitation.');
  }

  // 2. Set password and clear token
  user.password = password;
  user.setupPasswordToken = undefined as any;
  user.setupPasswordExpires = undefined as any;
  user.needsPasswordChange = false;
  user.status = USER_STATUS.ACTIVE;
  user.isEmailVerified = true;

  await user.save();

  return {
    message: 'Password set successfully. You can now login.',
    email: user.email
  };
};

/**
 * Resend Setup Password Invitation
 * Used when the original link expires or is lost.
 * Only works for users pending password setup.
 */
export const resendSetupInvitationService = async (email: string) => {
  // 1. Find user by email
  const query = User.findOne({ email });
  (query as any)._bypassContext = true;

  const user = await query.select('+setupPasswordToken +setupPasswordExpires status');

  if (!user) {
    throw new AppError(status.NOT_FOUND, 'User not found.');
  }

  // 2. Validate Status
  // If user is BLOCKED or DELETED, do not allow.
  if (user.status === USER_STATUS.BLOCKED || user.isDeleted) {
    throw new AppError(status.FORBIDDEN, 'Account is blocked or deleted. Contact support.');
  }

  // NOTE: Previously we blocked ACTIVE users. 
  // However, users might get stuck in ACTIVE state if setup failed at the end or if they forgot the password immediately.
  // Allowing ACTIVE users to "Resend Setup" effectively acts as a "Password Reset" via the setup flow, which is acceptable/safe here.

  /* 
  if (user.status === USER_STATUS.ACTIVE && !user.needsPasswordChange) {
       // Optional: We could redirect them to 'Forgot Password', but strictly allowing this helps the specific 'stuck' case.
       // We will proceed.
  }
  */


  // 3. Generate New Token
  const crypto = await import("crypto");
  const setupToken = crypto.default.randomBytes(32).toString('hex');
  const setupExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  user.setupPasswordToken = setupToken;
  user.setupPasswordExpires = setupExpires;
  await user.save();

  // 4. Send Email
  try {
    const { MailService } = await import("@shared/mail/mail.service.js");
    const setupUrl = `${appConfig.frontend_url}/auth/setup-password?token=${setupToken}`;

    await MailService.sendEmail(
      email,
      "Setup your Signature Bangla Account (Link Resent)",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0F172A; text-align: center;">Account Setup Invitation</h2>
        <p>Hello,</p>
        <p>You have requested a new link to set up your password for <strong>Signature Bangla</strong>.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${setupUrl}" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Up Password</a>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy this link: <br/> <a href="${setupUrl}">${setupUrl}</a></p>
        <p style="font-size: 14px; color: #666;">This secure link is valid for 72 hours.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Signature Bangla. All rights reserved.</p>
      </div>
      `
    );
  } catch (error) {
    console.error("Failed to resend invitation email:", error);
    throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to send email. Please try again later.');
  }

  return {
    message: 'Invitation link sent successfully. Please check your email.',
    email: user.email
  };
};

