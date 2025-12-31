
import { Router } from "express";
import { SettlementController } from "./settlement.controller.js";

const router = Router();

router.post("/", SettlementController.createSettlement);
router.get("/", SettlementController.getAllSettlement);
router.get("/:id", SettlementController.getSettlementById);
router.patch("/:id", SettlementController.updateSettlement);
router.delete("/:id", SettlementController.deleteSettlement);

export const SettlementRoutes = router;
