import { Router } from "express";

import superAdminRoutes from "./admin";
import businessAdminRoutes from "./vendor";
import vendorRoutes from "./vendor";
import customerRoutes from "./customer";
import publicRoutes from "./public";
import webhookRoutes from "./webhook";
import authRoutes from "./auth/auth.routes";

const router = Router();

router.use("/super-admin", superAdminRoutes);
router.use("/business-admin", businessAdminRoutes);
router.use("/vendor", vendorRoutes);
router.use("/customer", customerRoutes);
router.use("/public", publicRoutes);
router.use("/webhook", webhookRoutes);
router.use("/auth", authRoutes);

export default router;
