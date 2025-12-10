import type { IPermissionContext } from "@app/modules/iam/permission/permission.interface.ts";
import { permissionService } from "@app/modules/iam/permission/permission.service.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
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

      const userWithRoles = await User.findById(user.userId || user.id)
        .populate({
          path: 'roles',
          populate: [
            { path: 'permissions' },
            { path: 'permissionGroups', populate: { path: 'permissions' } },
            { path: 'inheritedRoles' }
          ]
        })
        .select('+directPermissions');

        
        
        if (!userWithRoles) {
          throw new AppError(status.NOT_FOUND, 'User not found');
        }

        const roles = userWithRoles?.roles.map((role: any) => role?.name);
        // console.log('USERRRRRRRRRR', roles)

        if(roles.includes(USER_ROLE.SUPER_ADMIN)){
          return next()
        }
    
           console.log('USERRRRRRRRRR from req.body', req.params.userId)
      // Build permission context with correct resource info
      const context: IPermissionContext = {
        user: {
          id: userWithRoles.id,
          roles: userWithRoles.roles.map((role: any) => role.name),
          businessUnits: userWithRoles.businessUnits,
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