import { Router } from "express";
import { storeRoutes } from "../../../modules/store/store-core/store-core.routes.js";

const router = Router();

router.use('/', storeRoutes);


export const storesRoutes = router;