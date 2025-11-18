import { Router } from "express";
import { vendorCoreRoutes } from "../../../modules/vendor/vendor-core/vendor-core.routes.js";

const router = Router();

router.use("/", vendorCoreRoutes);

export const vendorsRoutes = router;
