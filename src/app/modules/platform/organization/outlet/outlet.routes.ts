import express from "express";
import { OutletController } from "./outlet.controller.ts";
// import auth from "../../../../middlewares/auth";
// import { ENUM_USER_ROLE } from "../../../../enums/user";

import { OutletSettingsRoutes } from './settings/settings.routes.js';

const router = express.Router();

router.use('/:outletId/settings', OutletSettingsRoutes);

// Defined routes
router.post("/", OutletController.createOutlet);
router.get("/", OutletController.getAllOutlets);
router.get("/:id/stats", OutletController.getOutletStats);
router.get("/:id", OutletController.getOutletById);
router.patch("/:id", OutletController.updateOutlet);
router.delete("/:id", OutletController.deleteOutlet);

export const OutletRoutes = router;
