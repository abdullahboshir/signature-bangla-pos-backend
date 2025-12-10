import { Router } from "express";
import { getDashboardStatsController } from "./dashboard.controller.ts";

const router = Router();

router.get("/stats", getDashboardStatsController);

export const dashboardRoutes = router;
