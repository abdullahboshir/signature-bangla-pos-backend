
import { Router } from "express";
import { PayoutController } from "./payout.controller.js";

const router = Router();

router.post("/", PayoutController.createPayout);
router.get("/", PayoutController.getAllPayout);
router.get("/:id", PayoutController.getPayoutById);
router.patch("/:id", PayoutController.updatePayout);
router.delete("/:id", PayoutController.deletePayout);

export const PayoutRoutes = router;
