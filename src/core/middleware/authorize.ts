import type { IPermissionContext } from "@app/modules/iam/permission/permission.interface.ts";
import { getModuleByResource } from "@app/modules/iam/permission/module.constant.ts";
import { permissionService } from "@app/modules/iam/permission/permission.service.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { SystemSettings } from "@app/modules/platform/settings/system-settings/system-settings.model.ts";
import { User } from "@app/modules/iam/user/user.model.ts";
import catchAsync from "@core/utils/catchAsync.ts";
import AppError from "@shared/errors/app-error.ts";
import status from "http-status";



export const authorize = (resource: string, action: string) => {
  return catchAsync(async (req: any, _res: any, next: any) => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError(status.UNAUTHORIZED, 'Authentication required');
      }

      /* -------------------------------------------------------------------------- */
      /* 1️⃣  PERFORMANCE OPTIMIZATION: Check Super Admin First (Light Query)       */
      /* -------------------------------------------------------------------------- */
      // We only fetch basic role info first, without deep permission tree population.
      const initialUser = await User.findById(user.userId || user.id)
        .populate('globalRoles', 'name')
        .populate({
          path: 'businessAccess',
          populate: { path: 'role', select: 'name' }
        })
        .lean();

      if (!initialUser) {
        throw new AppError(status.NOT_FOUND, 'User not found');
      }

      const initialGlobalRoles = (initialUser.globalRoles || []).map((r: any) => r.name);
      const initialBusinessRoles = (initialUser.businessAccess || []).map((a: any) => a.role?.name).filter(Boolean);
      const initialRoles = [...new Set([...initialGlobalRoles, ...initialBusinessRoles])];

      // Normalized check
      const normalizedRoles = initialRoles.map(r => r.toLowerCase().replace(/\s+/g, '-'));

      if (normalizedRoles.includes(USER_ROLE.SUPER_ADMIN)) {
        // Super Admin bypass - NO deep population needed
        return next();
      }

      /* -------------------------------------------------------------------------- */
      /* 2️⃣  Regular User: Fetch Full Permission Tree (Heavy Query)               */
      /* -------------------------------------------------------------------------- */
      const userWithRoles = await User.findById(user.userId || user.id)
        .populate({
          path: 'globalRoles',
          populate: [
            { path: 'permissions' },
            { path: 'permissionGroups', populate: { path: 'permissions' } },
          ]
        })
        .populate({
          path: 'businessAccess',
          populate: [
            {
              path: 'role',
              populate: [
                { path: 'permissions' },
                { path: 'permissionGroups', populate: { path: 'permissions' } }
              ]
            },
            {
              path: 'businessUnit',
              select: 'name slug id activeModules company',
              populate: { path: 'company', select: 'activeModules' }
            }
          ]
        })
        .select('+directPermissions');



      if (!userWithRoles) {
        throw new AppError(status.NOT_FOUND, 'User not found');
      }

      // --------------------------------------------------------------------------
      // 🛡️ MODULE LEVEL GUARD (Tiered: System > Company > BU)
      // --------------------------------------------------------------------------
      const requiredModule = getModuleByResource(resource);
      if (requiredModule) {
        // 1. System Global Check (Maintenance Mode)
        const systemSettings = await SystemSettings.findOne().lean();
        // @ts-ignore
        if (systemSettings?.enabledModules && systemSettings.enabledModules[requiredModule] === false) {
          throw new AppError(status.SERVICE_UNAVAILABLE, `System Module '${requiredModule.toUpperCase()}' is temporarily disabled.`);
        }

        const targetBuParam = req.params.businessUnit || req.params.businessUnitId || req.headers['x-business-unit'];

        if (targetBuParam) {
          const targetAccess = (userWithRoles.businessAccess || []).find((a: any) =>
            (a.businessUnit?.id?.toString() === targetBuParam.toString()) ||
            (a.businessUnit?.slug === targetBuParam)
          );

          if (targetAccess?.businessUnit) {
            // 2. Company Level Check (Organization License)
            if (targetAccess.businessUnit.company?.activeModules) {
              // @ts-ignore
              const isCompanyActive = targetAccess.businessUnit.company.activeModules[requiredModule];
              if (isCompanyActive === false) {
                throw new AppError(status.PAYMENT_REQUIRED, `Organization License does not include '${requiredModule.toUpperCase()}' module.`);
              }
            }

            // 3. Business Unit Level Check (Unit Toggle)
            if (targetAccess.businessUnit.activeModules) {
              // @ts-ignore
              const isBuActive = targetAccess.businessUnit.activeModules[requiredModule];
              if (isBuActive === false) {
                throw new AppError(status.FORBIDDEN, `Module '${requiredModule.toUpperCase()}' is active in your plan but disabled for this Unit.`);
              }
            }
          }
        }
      }

      // Aggregate Roles
      const globalRoles = (userWithRoles.globalRoles || []).map((r: any) => r.name);
      const businessRoles = (userWithRoles.businessAccess || []).map((a: any) => a.role?.name).filter(Boolean);
      const roles = [...new Set([...globalRoles, ...businessRoles])];

      // Aggregate Business Units
      const businessUnits = (userWithRoles.businessAccess || []).map((a: any) => a.businessUnit?.id || a.businessUnit?.toString()).filter(Boolean);

      // console.log('USERRRRRRRRRR', roles)

      console.log('USERRRRRRRRRR from req.body', req.params.userId)
      // Build permission context with correct resource info
      const context: IPermissionContext = {
        user: {
          id: userWithRoles.id,
          roles: roles,
          businessUnits: businessUnits,
          ...(userWithRoles.branches !== undefined && { branches: userWithRoles.branches }),
          ...(userWithRoles.vendorId !== undefined && { vendorId: userWithRoles.vendorId }),
          ...(userWithRoles.region !== undefined && { region: userWithRoles.region })
        },
        resource: {
          id: req.params.id || req.params.resourceId,
          ownerId: user?.userId || req.params.userId || req.params.ownerId,
          category: user?.category || req.params.category || req.query?.category,
          region: user?.region || req.params.region || req.user?.region
        },
        environment: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timeOfDay: new Date().toISOString()
        }
      };

      console.log('permission context', context)
      // Check permission using RBAC/ABAC system
      const result = await permissionService.checkPermission(
        userWithRoles,
        resource,
        action,
        context
      );

      if (!result.allowed) {
        console.log("[AUTHORIZE MIDDLEWARE] Permission denied:", result.reason);
        throw new AppError(
          status.FORBIDDEN,
          result.reason || 'Insufficient permissions for this action'
        );
      }

      console.log("[AUTHORIZE MIDDLEWARE] Permission granted");

      // Attach permission result and context for use in controllers
      req.permissionResult = result;
      req.permissionContext = context;

      next();

    } catch (error) {
      next(error);
    }
  });
};