import { Router } from "express";

// import businessAdminRoutes from "./vendor";

import { authGroupRoutes } from "./auth/auth.routes.js";
import { adminGroupRoutes } from "./super-admin/index.js";
import { customerGroupRoutes } from "./customer/index.js";
import { publicGroupRoutes } from "./public/index.js";
import { PackageRoutes } from "../../modules/package/package.routes.ts";
import { LicenseRoutes } from "../../modules/license/license.routes.ts";

const router = Router();

router.use("/super-admin", adminGroupRoutes);
// router.use("/business-admin", businessAdminRoutes);
router.use("/customer", customerGroupRoutes);
router.use("/public", publicGroupRoutes);
// router.use("/webhook", webhookRoutes);
router.use("/auth", authGroupRoutes);
router.use("/packages", PackageRoutes);
router.use("/licenses", LicenseRoutes);

export const v1Routes = router;
