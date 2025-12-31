
import { Router } from "express";
import { PayrollController } from "./payroll.controller.js";

const router = Router();

router.post("/", PayrollController.createPayroll);
router.get("/", PayrollController.getAllPayroll);
router.get("/:id", PayrollController.getPayrollById);
router.patch("/:id", PayrollController.updatePayroll);
router.delete("/:id", PayrollController.deletePayroll);

export const PayrollRoutes = router;
