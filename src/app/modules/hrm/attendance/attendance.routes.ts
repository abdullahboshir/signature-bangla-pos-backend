
import { Router } from "express";
import { AttendanceController } from "./attendance.controller.js";

const router = Router();

router.post("/", AttendanceController.createAttendance);
router.get("/", AttendanceController.getAllAttendance);
router.get("/:id", AttendanceController.getAttendanceById);
router.patch("/:id", AttendanceController.updateAttendance);
router.delete("/:id", AttendanceController.deleteAttendance);

export const AttendanceRoutes = router;
