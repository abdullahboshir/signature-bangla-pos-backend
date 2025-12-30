import { PermissionActionObj, PermissionSourceObj } from '@app/modules/iam/permission/permission.constant.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import auth from '@core/middleware/auth.ts';
import { authorize } from '@core/middleware/authorize.ts';
import { validateRequest } from '@core/middleware/validateRequest.ts';
import { Router } from 'express';

import type { AnyZodObject } from 'zod/v3';
import { createBusinessUnitValidationSchema as _createBusinessUnitValidationSchema, updateBusinessUnitSchema } from './business-unit.validation.ts';
import { createBusinessUnitController, getAllBusinessUnitsController, deleteBusinessUnitController, getBusinessUnitByIdController, updateBusinessUnitController, getBusinessUnitStatsController } from './business-unit.controller.ts';


const router = Router();

router.get(
  '/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.businessUnit, PermissionActionObj.view),
  getAllBusinessUnitsController
);

router.post(
  '/create',
  auth(USER_ROLE.SUPER_ADMIN), // Only super admin can create business units
  // authorize(PermissionSourceObj.businessUnit, PermissionActionObj.create), // Temporarily disabled
  // validateRequest(createBusinessUnitValidationSchema as unknown as AnyZodObject),
  createBusinessUnitController
);

router.delete(
  '/:businessUnitId',
  auth(USER_ROLE.SUPER_ADMIN),
  // authorize(PermissionSourceObj.businessUnit, PermissionActionObj.delete),
  deleteBusinessUnitController
);

router.get(
  '/:businessUnitId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  getBusinessUnitByIdController
);

router.patch(
  '/:businessUnitId',
  auth(USER_ROLE.SUPER_ADMIN),
  validateRequest(updateBusinessUnitSchema as unknown as AnyZodObject),
  updateBusinessUnitController
);

router.get(
  '/:businessUnitId/dashboard',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
  getBusinessUnitStatsController
);


export const businessUnitRoutes = router;