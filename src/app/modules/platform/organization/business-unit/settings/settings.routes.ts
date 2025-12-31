import express from "express";
import { BusinessUnitSettingsController } from "./settings.controller.js";

const router = express.Router();

router.get(
    "/:businessUnitId",
    BusinessUnitSettingsController.getSettings
);

router.patch(
    "/:businessUnitId",
    BusinessUnitSettingsController.updateSettings
);

export const BusinessUnitSettingsRoutes = router;
