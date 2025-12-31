
import { Router } from "express";
import { DepartmentController } from "./department.controller.js";

const router = Router();

router.post("/", DepartmentController.createDepartment);
router.get("/", DepartmentController.getAllDepartment);
router.get("/:id", DepartmentController.getDepartmentById);
router.patch("/:id", DepartmentController.updateDepartment);
router.delete("/:id", DepartmentController.deleteDepartment);

export const DepartmentRoutes = router;
