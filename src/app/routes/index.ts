import { Router } from "express";
import { v1Routes } from "./v1/index.ts";
import { SystemSettingsRoutes } from "../modules/platform/settings/system-settings/system-settings.routes.js";
import { ApiResponse } from "@core/utils/api-response.ts";

const router = Router();

router.use("/v1", v1Routes);
router.use("/v1/system-settings", SystemSettingsRoutes);

router.get("health", (_req, res) => {
  ApiResponse.success(res, {
    status: "Success",
    timestamp: new Date().toISOString(),
  }, "Server is running");
});

export default router;
