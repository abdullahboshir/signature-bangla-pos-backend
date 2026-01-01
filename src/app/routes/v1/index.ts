import { Router } from "express";

// import businessAdminRoutes from "./vendor";

import { authGroupRoutes } from "./auth/auth.routes.js";
import { adminGroupRoutes } from "./super-admin/index.js";
import { customerGroupRoutes } from "./customer/index.js";
import { publicGroupRoutes } from "./public/index.js";
import { PackageRoutes } from "../../modules/platform/package/package.routes.ts";
import { LicenseRoutes } from "../../modules/platform/license/license.routes.ts";
import { userRoutes } from "../../modules/iam/user/user.routes.ts";

const router = Router();

router.use("/super-admin", adminGroupRoutes);
// router.use("/business-admin", businessAdminRoutes);
router.use("/customer", customerGroupRoutes);
router.use("/public", publicGroupRoutes);
// router.use("/webhook", webhookRoutes);
router.use("/auth", authGroupRoutes);
router.use("/user", userRoutes); // Registered User Routes (Profile, Settings, etc.)
router.use("/packages", PackageRoutes);
router.use("/licenses", LicenseRoutes);

export const v1Routes = router;
