import express from "express";
import { PurchaseReportController } from "./purchase-report.controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.js";

const router = express.Router();

router.get(
    "/stats",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    PurchaseReportController.getPurchaseStats
);

export const PurchaseReportRoutes = router;
