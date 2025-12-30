import { authRoutes } from "@app/modules/iam/auth/auth.routes.ts";
import { Router } from "express";

const router = Router();

router.use("/", authRoutes);

export const authGroupRoutes = router;
