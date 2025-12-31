
import { Router } from "express";
import { CurrencyController } from "./currency.controller.js";

const router = Router();

router.post("/", CurrencyController.createCurrency);
router.get("/", CurrencyController.getAllCurrency);
router.get("/:id", CurrencyController.getCurrencyById);
router.patch("/:id", CurrencyController.updateCurrency);
router.delete("/:id", CurrencyController.deleteCurrency);

export const CurrencyRoutes = router;
