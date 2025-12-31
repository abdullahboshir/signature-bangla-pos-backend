
import { Router } from "express";
import { DesignationController } from "./designation.controller.js";

const router = Router();

router.post("/", DesignationController.createDesignation);
router.get("/", DesignationController.getAllDesignation);
router.get("/:id", DesignationController.getDesignationById);
router.patch("/:id", DesignationController.updateDesignation);
router.delete("/:id", DesignationController.deleteDesignation);

export const DesignationRoutes = router;
