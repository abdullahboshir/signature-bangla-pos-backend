import { PermissionActionObj, PermissionSourceObj } from '@app/modules/iam/permission/permission.constant.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import auth from '@core/middleware/auth.ts';
import { authorize } from '@core/middleware/authorize.ts';
import { validateRequest } from '@core/middleware/validateRequest.ts';
import {Router} from 'express';

import type { AnyZodObject } from 'zod/v3';
import { createBusinessUnitValidationSchema } from './business-unit.validation.ts';
import { createBusinessUnitController } from './business-unit.controller.ts';


const router = Router();

router.post(
  '/create',
   auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
   authorize(PermissionSourceObj.businessUnit, PermissionActionObj.create),
  // validateRequest(createBusinessUnitValidationSchema as unknown as AnyZodObject),
  createBusinessUnitController  
);


export const businessUnitRoutes = router;