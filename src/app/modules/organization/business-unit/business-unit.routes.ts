import { PermissionActionObj, PermissionSourceObj } from '@app/modules/iam/permission/permission.constant.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import auth from '@core/middleware/auth.ts';
import { authorize } from '@core/middleware/authorize.ts';
import { validateRequest } from '@core/middleware/validateRequest.ts';
import { upload } from '@core/utils/file-upload.ts';
import {Router, type Request, type Response, type NextFunction} from 'express';

import type { AnyZodObject } from 'zod/v3';
import { createStoreValidationSchema } from './business-unit.validation.ts';
import { createStoreController } from './business-unit.controller.ts';

const router = Router();

router.post(
  '/create-business-unit',
   auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
   authorize(PermissionSourceObj.business_unit, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  },
  validateRequest(createStoreValidationSchema as unknown as AnyZodObject),
  createStoreController  
);


export const businessUnitRoutes = router;