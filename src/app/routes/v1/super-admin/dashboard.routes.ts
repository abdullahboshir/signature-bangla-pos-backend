import { Router } from "express";
import { getDashboardStatsController } from "./dashboard.controller.ts";

import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";
import auth from "@core/middleware/auth.ts";

const router = Router();

router.get("/stats", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER), getDashboardStatsController);

export const dashboardRoutes = router;
