
import { Router } from "express";
import { LeaveController } from "./leave.controller.js";

const router = Router();

router.post("/", LeaveController.createLeave);
router.get("/", LeaveController.getAllLeave);
router.get("/:id", LeaveController.getLeaveById);
router.patch("/:id", LeaveController.updateLeave);
router.delete("/:id", LeaveController.deleteLeave);

export const LeaveRoutes = router;
