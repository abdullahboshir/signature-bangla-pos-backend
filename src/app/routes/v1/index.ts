import { Router } from "express";

// import businessAdminRoutes from "./vendor";

import { authGroupRoutes } from "./auth/auth.routes.ts";
import { adminGroupRoutes } from "./super-admin/index.ts";
import { customerGroupRoutes } from "./customer/index.ts";
import { publicGroupRoutes } from "./public/index.ts";

const router = Router();

router.use("/super-admin", adminGroupRoutes);
// router.use("/business-admin", businessAdminRoutes);
router.use("/customer", customerGroupRoutes);
router.use("/public", publicGroupRoutes);
// router.use("/webhook", webhookRoutes);
router.use("/auth", authGroupRoutes);

export const v1Routes = router;
