import { Router } from "express";
import { customerRoutes } from "../../../app/modules/customer/customer.routes.js";



const router = Router();

router.use("/", customerRoutes);

export default router;