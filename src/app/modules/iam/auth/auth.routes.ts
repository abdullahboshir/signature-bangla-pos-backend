import { Router } from "express";

import { loginZodSchema, setupPasswordZodSchema } from "./auth.validation.js";
import { authMeController, loginController, logoutController, refreshTokenController, setupPasswordController } from "./auth.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.js";
import auth from "@core/middleware/auth.js";
import { USER_ROLE_ARRAY } from "../user/user.constant.js";



const router = Router();


router.post('/login', validateRequest(loginZodSchema as unknown as AnyZodObject), loginController)

router.post(
  '/refresh-token',
  refreshTokenController
)

router.get('/me', auth(...USER_ROLE_ARRAY), authMeController)
router.post('/logout', logoutController)

// Public endpoint for new Company Owners to set their initial password
router.post('/setup-password', validateRequest(setupPasswordZodSchema as unknown as AnyZodObject), setupPasswordController)


export const authRoutes = router; 