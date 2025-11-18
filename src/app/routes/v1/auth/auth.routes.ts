import { Router } from "express";
import { authRoutes } from "../../../app/modules/auth/auth.routes.js";

const router = Router();

router.use("/", authRoutes);

export default router;