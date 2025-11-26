import { businessUnitRoutes } from "@app/modules/organization/business-unit/business-unit.routes.ts";
import { Router } from "express";


const router = Router();

router.use('/', businessUnitRoutes);


export const businessUnitGrouptRoutes = router;