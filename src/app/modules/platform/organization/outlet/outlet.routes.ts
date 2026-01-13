import express from "express";
import { OutletController } from "./outlet.controller.ts";
import { resourceOwnerGuard } from "@app/middlewares/resourceOwnerGuard.ts";
import { Outlet } from "./outlet.model.ts";

import { OutletSettingsRoutes } from './settings/settings.routes.js';

const router = express.Router();

router.use('/:outletId/settings', OutletSettingsRoutes);

// Validate outletId middleware
import mongoose from "mongoose";

const validateOutletId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { outletId } = req.params;
    if (outletId && outletId !== 'new' && !mongoose.Types.ObjectId.isValid(outletId)) {
        return res.status(400).json({
            success: false,
            message: `Invalid Outlet ID: ${outletId}`
        });
    }
    next();
};

// Defined routes
router.post("/", OutletController.createOutlet);
router.get("/", OutletController.getAllOutlets);
router.get("/:outletId/stats", validateOutletId, resourceOwnerGuard(Outlet), OutletController.getOutletStats);
router.get("/:outletId", validateOutletId, resourceOwnerGuard(Outlet), OutletController.getOutletById);
router.patch("/:outletId", validateOutletId, resourceOwnerGuard(Outlet), OutletController.updateOutlet);
router.delete("/:outletId", validateOutletId, resourceOwnerGuard(Outlet), OutletController.deleteOutlet);

export const OutletRoutes = router;
