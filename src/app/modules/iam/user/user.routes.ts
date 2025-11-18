import { Router, type NextFunction, type Request, type Response } from 'express'
import { upload } from '../../utils/IMGUploader.js'
import { validateRequest } from '../../middlewares/validateRequest.js'
import { createCustomerController, createVendorController, getUsersController } from './user.controller.js'
import { createCustomerZodSchema } from '../customer/customer.validation.js'
import { CreateVendorValidation } from '../vendor/vendor-core/vendor-core.validation.js'
import type { AnyZodObject } from 'zod/v3'
import { USER_ROLE } from './user.constant.js'
import auth from '../../middlewares/auth.js'
import { authorize } from '../../middlewares/authorize.js'
import { PermissionActionObj, PermissionSourceObj } from '../permission/permission.constant.js'


const router = Router()


router.get('/getUsers', getUsersController)

router.post(
  '/create-customer',
   auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
   authorize(PermissionSourceObj.customer, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  },
  validateRequest(createCustomerZodSchema as unknown as AnyZodObject),
  createCustomerController
)

router.post(
  '/create-vendor',
   auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
   authorize(PermissionSourceObj.vendor, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  },
  validateRequest(CreateVendorValidation as unknown as AnyZodObject),
  createVendorController
)


export const userRoutes = router
