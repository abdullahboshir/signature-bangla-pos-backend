import { Router } from "express";

import { loginZodSchema } from "./auth.validation.js";
import { loginController } from "./auth.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";


const router = Router();


router.post('/login', validateRequest(loginZodSchema as unknown as AnyZodObject), loginController)


export const authRoutes = router; 