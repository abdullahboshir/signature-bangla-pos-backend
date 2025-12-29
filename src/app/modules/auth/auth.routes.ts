import { Router } from "express";

import { loginZodSchema } from "./auth.validation.js";
import { authMeController, loginController, logoutController, refreshTokenController } from "./auth.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE_ARRAY } from "../iam/user/user.constant.ts";


const router = Router();


router.post('/login', validateRequest(loginZodSchema as unknown as AnyZodObject), loginController)

router.post(
  '/refresh-token',
  refreshTokenController
)

router.get('/me', auth(...USER_ROLE_ARRAY), authMeController)
router.post('/logout', logoutController)


export const authRoutes = router; 