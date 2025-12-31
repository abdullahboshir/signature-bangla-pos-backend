import express from "express";
import { OutletController } from "./outlet.controller.ts";
// import auth from "../../../../middlewares/auth";
// import { ENUM_USER_ROLE } from "../../../../enums/user";

const router = express.Router();

// Defined routes
router.post("/", OutletController.createOutlet);
router.get("/", OutletController.getAllOutlets);
router.get("/:id/stats", OutletController.getOutletStats);
router.get("/:id", OutletController.getOutletById);
router.patch("/:id", OutletController.updateOutlet);
router.delete("/:id", OutletController.deleteOutlet);

export const OutletRoutes = router;
