import { Router } from "express";
import catalogRoutes from "./catalog.routes.js";
import categoryRoutes from "./categories.routes.js";
import searchRoutes from "./search.routes.js";
import { storefrontRoutes } from "@app/modules/storefront/storefront.routes.ts";
// import dealsRoutes from "./deals.routes.js";
// import flashSalesRoutes from "./flash-sales.routes.js";
// import recommendationsRoutes from "./recommendations.routes.js";

const router = Router();

router.use("/catalog", catalogRoutes);
router.use("/categories", categoryRoutes);
router.use("/search", searchRoutes);
router.use("/storefront", storefrontRoutes);
// router.use("/deals", dealsRoutes);
// router.use("/flash-sales", flashSalesRoutes);
// router.use("/recommendations", recommendationsRoutes);

export const publicGroupRoutes = router;
