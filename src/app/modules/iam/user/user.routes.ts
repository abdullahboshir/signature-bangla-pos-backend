import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";

import {
  createCustomerController,
  getUsersController,
  updateUserController,
} from "./user.controller.js";
import { createUserController } from "./create-user.controller.ts";

import type { AnyZodObject } from "zod/v3";
import { USER_ROLE } from "./user.constant.js";

import {
  PermissionActionObj,
  PermissionSourceObj,
} from "../permission/permission.constant.js";
import auth from "@core/middleware/auth.ts";
import { authorize } from "@core/middleware/authorize.ts";
import { createCustomerZodSchema } from "@app/modules/customer/customer.validation.ts";
import { upload } from "@core/utils/file-upload.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.get("/all-users", getUsersController);

router.post(
  "/create",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  // authorize(PermissionSourceObj.user, PermissionActionObj.create),
  createUserController
);

router.post(
  "/create-customer",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.customer, PermissionActionObj.create),
  upload.single("file"),
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(createCustomerZodSchema as unknown as AnyZodObject),
  createCustomerController
);

// router.post(
//   '/create-vendor',
//    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
//    authorize(PermissionSourceObj.vendor, PermissionActionObj.create),
//   upload.single('file'),
//   (req: Request, _res: Response, next: NextFunction) => {
//     req.body = JSON.parse(req.body.data)
//     next()
//   },
//   validateRequest(CreateVendorValidation as unknown as AnyZodObject),
//   createVendorController
// )

// Update user (roles, status, etc.)
router.patch(
  "/:id",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  // authorize(PermissionSourceObj.user, PermissionActionObj.update),
  updateUserController
);

// Update user (roles, status, etc.)
router.patch(
  "/:id",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  // authorize(PermissionSourceObj.user, PermissionActionObj.update),
  updateUserController
);

export const userRoutes = router;
