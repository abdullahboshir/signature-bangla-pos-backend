
import { Router } from "express";
import { AccountController } from "./accounts.controller.js";

const router = Router();

router.post("/", AccountController.createAccount);
router.get("/", AccountController.getAllAccount);
router.get("/:id", AccountController.getAccountById);
router.patch("/:id", AccountController.updateAccount);
router.delete("/:id", AccountController.deleteAccount);

export const AccountRoutes = router;
