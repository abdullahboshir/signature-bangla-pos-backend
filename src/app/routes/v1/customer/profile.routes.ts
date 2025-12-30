import { customerRoutes } from "@app/modules/contacts/customers/customer.routes.ts";
import { Router } from "express";




const router = Router();

router.use("/", customerRoutes);

export default router;