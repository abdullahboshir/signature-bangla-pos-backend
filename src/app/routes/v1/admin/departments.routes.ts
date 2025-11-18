import { Router } from "express";
import { departmentRoutes } from "../../../modules/department/department.routes.js";


const router = Router();

router.use("/", departmentRoutes);

export default router;