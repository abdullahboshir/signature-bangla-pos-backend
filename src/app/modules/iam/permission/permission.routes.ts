import { Router } from 'express';

import { PermissionActionObj, PermissionSourceObj } from './permission.constant.js';
import { USER_ROLE } from '../user/user.constant.js';
import {
  getAllPermissions,
  getPermissionResources,
  getPermissionById,
  getUserPermissions,
  checkUserPermission
} from './permission.controller.js';
import auth from '@core/middleware/auth.ts';
import { authorize } from '@core/middleware/authorize.ts';

const router = Router();

// Get unique permission resources
router.get('/resources',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  getPermissionResources
);

// Get all permissions - Admin only
router.get('/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.system, PermissionActionObj.view),
  getAllPermissions
);

// Get single permission
router.get('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.system, PermissionActionObj.read),
  getPermissionById
);

// Get permissions for a specific user
router.get('/user/:userId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  getUserPermissions
);

// Check if user has specific permission
router.post('/check',
  auth(),
  checkUserPermission
);

export const permissionRoutes = router;
