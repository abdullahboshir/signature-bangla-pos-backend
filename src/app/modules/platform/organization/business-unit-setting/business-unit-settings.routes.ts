import express from "express";
import { BusinessUnitSettingsController } from "./business-unit-settings.controller.js";

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
