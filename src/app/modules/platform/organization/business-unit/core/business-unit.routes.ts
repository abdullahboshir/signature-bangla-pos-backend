import { PermissionActionObj, PermissionSourceObj } from '@app/modules/iam/permission/permission.constant.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import auth from '../../../../../../core/middleware/auth.js';
import { authorize } from '../../../../../../core/middleware/authorize.js';
import { validateRequest } from '../../../../../../core/middleware/validateRequest.js';
import { Router } from 'express';

import type { AnyZodObject } from 'zod/v3';
import { createBusinessUnitValidationSchema as _createBusinessUnitValidationSchema, updateBusinessUnitSchema } from './business-unit.validation.ts';
import { createBusinessUnitController, getAllBusinessUnitsController, deleteBusinessUnitController, getBusinessUnitByIdController, updateBusinessUnitController, getBusinessUnitStatsController } from './business-unit.controller.ts';


const router = Router();

router.get(
  '/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.COMPANY_OWNER),
  authorize(PermissionSourceObj.businessUnit, PermissionActionObj.view),
  getAllBusinessUnitsController
);

router.post(
  '/create',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER), // Both super admin and company owner can create BUs
  // authorize(PermissionSourceObj.businessUnit, PermissionActionObj.create), // Temporarily disabled
  validateRequest(_createBusinessUnitValidationSchema as unknown as AnyZodObject),
  createBusinessUnitController
);

router.delete(
  '/:businessUnitId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER),
  // authorize(PermissionSourceObj.businessUnit, PermissionActionObj.delete),
  deleteBusinessUnitController
);

router.get(
  '/:businessUnitId',
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.COMPANY_OWNER,
    USER_ROLE.MANAGER,
    USER_ROLE.OUTLET_MANAGER,
    USER_ROLE.SALES_ASSOCIATE,
    USER_ROLE.CASHIER,
    USER_ROLE.STAFF
  ),
  getBusinessUnitByIdController
);

router.patch(
  '/:businessUnitId',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER),
  validateRequest(updateBusinessUnitSchema as unknown as AnyZodObject),
  updateBusinessUnitController
);

router.get(
  '/:businessUnitId/dashboard',
  auth(
    USER_ROLE.SUPER_ADMIN,
    USER_ROLE.ADMIN,
    USER_ROLE.COMPANY_OWNER,
    USER_ROLE.MANAGER,
    USER_ROLE.OUTLET_MANAGER,
    USER_ROLE.SALES_ASSOCIATE,
    USER_ROLE.CASHIER,
    USER_ROLE.STAFF
  ),
  getBusinessUnitStatsController
);


export const businessUnitRoutes = router;