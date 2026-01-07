import express from "express";
import { ProfitLossController } from "./profit-loss.controller.js";

import { USER_ROLE } from "@app/modules/iam/index.js";
import auth from "@core/middleware/auth.ts";

const router = express.Router();

router.get(
    "/statement",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    ProfitLossController.getProfitLoss
);

export const ProfitLossRoutes = router;
