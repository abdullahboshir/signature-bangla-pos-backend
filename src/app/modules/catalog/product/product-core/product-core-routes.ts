import { Router, type Request, type Response, type NextFunction } from "express";

import { productZodSchema } from "./product-core-validation.js";
import { createProductController } from "./product-core-controller.js";
import type { AnyZodObject } from "zod/v3";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import { PermissionActionObj, PermissionSourceObj } from "@app/modules/iam/permission/permission.constant.ts";
import { authorize } from "@core/middleware/authorize.ts";
import { upload } from "@core/utils/file-upload.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";




const router = Router();


router.post('/create', auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
   authorize(PermissionSourceObj.customer, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  }, validateRequest(productZodSchema as unknown as AnyZodObject), createProductController)



export const productRoutes = router;