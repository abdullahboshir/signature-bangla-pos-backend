
import { Router } from "express";
import { ReconciliationController } from "./reconciliation.controller.js";

const router = Router();

router.post("/", ReconciliationController.createReconciliation);
router.get("/", ReconciliationController.getAllReconciliation);
router.get("/:id", ReconciliationController.getReconciliationById);
router.patch("/:id", ReconciliationController.updateReconciliation);
router.delete("/:id", ReconciliationController.deleteReconciliation);

export const ReconciliationRoutes = router;
