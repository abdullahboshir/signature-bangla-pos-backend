import { customerRoutes } from "@app/modules/customer/customer.routes.ts";
import { Router } from "express";




const router = Router();

router.use("/", customerRoutes);

export default router;