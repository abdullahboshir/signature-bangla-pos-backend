import {Router, type Request, type Response, type NextFunction} from 'express';
import auth from '../../../middlewares/auth.js';
import { authorize } from '../../../middlewares/authorize.js';
import { USER_ROLE } from '../../user/user.constant.js';
import { PermissionActionObj, PermissionSourceObj } from '../../permission/permission.constant.js';
import { upload } from '../../../utils/IMGUploader.js';
import { validateRequest } from '../../../middlewares/validateRequest.js';
import type { AnyZodObject } from 'zod/v3';
import { createStoreValidationSchema } from './business-unit.validation.js';
import { createStoreController } from './store-core.controller.js';

const router = Router();

router.post(
  '/create-store',
   auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
   authorize(PermissionSourceObj.store, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  },
  validateRequest(createStoreValidationSchema as unknown as AnyZodObject),
  createStoreController  
);


export const storeRoutes = router;