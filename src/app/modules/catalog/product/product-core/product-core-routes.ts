import { Router, type Request, type Response, type NextFunction } from "express";
import auth from "../../../middlewares/auth.js";
import { USER_ROLE } from "../../user/user.constant.js";
import { PermissionActionObj, PermissionSourceObj } from "../../permission/permission.constant.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { productZodSchema } from "./product-core-validation.js";
import { createProductController } from "./product-core-controller.js";
import type { AnyZodObject } from "zod/v3";
import { authorize } from "../../../middlewares/authorize.js";
import { upload } from "../../../utils/IMGUploader.js";




const router = Router();


router.post('/create', auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
   authorize(PermissionSourceObj.customer, PermissionActionObj.create),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data)
    next()
  }, validateRequest(productZodSchema as unknown as AnyZodObject), createProductController)



export const productRoutes = router;