
import { Router } from "express";
import { TransactionController } from "./transaction.controller.js";

const router = Router();

router.post("/", TransactionController.createTransaction);
router.get("/", TransactionController.getAllTransaction);
router.get("/:id", TransactionController.getTransactionById);
router.patch("/:id", TransactionController.updateTransaction);
router.delete("/:id", TransactionController.deleteTransaction);

export const TransactionRoutes = router;
