import express from "express";
import { SalesReportController } from "./sales-report.controller.js";

import { USER_ROLE } from "@app/modules/iam/user/user.constant.js";
import auth from "@core/middleware/auth.ts";

const router = express.Router();

router.get(
    "/stats",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    SalesReportController.getSalesStats
);

export const SalesReportRoutes = router;
