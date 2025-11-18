import type { IPermissionContext } from "@app/modules/iam/permission/permission.interface.ts";
import { permissionService } from "@app/modules/iam/permission/permission.service.ts";
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
        
      // Build permission context with correct resource info
      const context: IPermissionContext = {
        user: {
          id: userWithRoles.id,
          roles: userWithRoles.roles.map((role: any) => role.name),
          departments: userWithRoles.departments,
          ...(userWithRoles.branches !== undefined && { branches: userWithRoles.branches }),
          ...(userWithRoles.vendorId !== undefined && { vendorId: userWithRoles.vendorId }),
          ...(userWithRoles.region !== undefined && { region: userWithRoles.region })
        },
        resource: {
          id: req.params.id || req.params.resourceId,
          ownerId: req.body?.ownerId || req.params.userId || req.params.ownerId,
          vendorId: req.body?.vendorId || req.params.vendorId || req.user?.vendorId,
          category: req.body?.category || req.params.category || req.query?.category,
          region: req.body?.region || req.params.region || req.user?.region
        },
        environment: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timeOfDay: new Date().toISOString()
        }
      };
      
      console.log("[AUTHORIZE MIDDLEWARE] Checking permission:", {
        resource,
        action,
        userId: userWithRoles.id,
        roles: context.user.roles
      });

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