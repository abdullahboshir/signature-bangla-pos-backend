import express from "express";
import { StockReportController } from "./stock-report.controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.js";

const router = express.Router();

router.get(
    "/valuation",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    StockReportController.getStockValuation
);

export const StockReportRoutes = router;
