import { Router } from 'express';
import auth from '../../middlewares/auth.js';
import { authorize } from '../../middlewares/authorize.js';
import { PermissionActionObj, PermissionSourceObj } from '../permission/permission.constant.js';
import { USER_ROLE } from '../user/user.constant.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  removePermissionsFromRole
} from './role.controller.js';
import { createRoleValidation, updateRoleValidation } from './role.validation.js';
import type { AnyZodObject } from 'zod/v3';

const router = Router();

// Get all roles
router.get('/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.view),
  getAllRoles
);

// Get single role
router.get('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.read),
  getRoleById
);

// Create role
router.post('/',
  auth(USER_ROLE.SUPER_ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.create),
  validateRequest(createRoleValidation as unknown as AnyZodObject),
  createRole
);

// Update role
router.patch('/:id',
  auth(USER_ROLE.SUPER_ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.update),
  validateRequest(updateRoleValidation as unknown as AnyZodObject),
  updateRole
);

// Delete role
router.delete('/:id',
  auth(USER_ROLE.SUPER_ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.delete),
  deleteRole
);

// Assign permissions to role
router.post('/:id/permissions',
  auth(USER_ROLE.SUPER_ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.manage),
  assignPermissionsToRole
);

// Remove permissions from role
router.delete('/:id/permissions',
  auth(USER_ROLE.SUPER_ADMIN),
  authorize(PermissionSourceObj.role, PermissionActionObj.manage),
  removePermissionsFromRole
);

export const roleRoutes = router;
