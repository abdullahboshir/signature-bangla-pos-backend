import { Router } from "express";
import { userGroupRoutes } from "./users.routes.ts";

// import vendorsRoutes from "./vendors.routes.js";
// import productsRoutes from "./products.routes.js";
import categoriesRoutes from "./categories.routes.ts";
import { businessUnitGrouptRoutes } from "./business-unit.routes.ts";

// import { vendorsRoutes } from "./vendors.routes.js";

// import ordersRoutes from "./orders.routes.js";
// import analyticsRoutes from "./analytics.routes.js";
// import systemRoutes from "./system.routes.js";
// import disputesRoutes from "./disputes.routes.js";
// import reportsRoutes from "./reports.routes.js";

const router = Router();

router.use("/users", userGroupRoutes);
router.use("/business-unit", businessUnitGrouptRoutes);
// router.use("/vendors", vendorsRoutes);
// router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/departments", categoriesRoutes);
// router.use("/orders", ordersRoutes);
// router.use("/analytics", analyticsRoutes);
// router.use("/system", systemRoutes);
// router.use("/disputes", disputesRoutes);
// router.use("/reports", reportsRoutes);

export const adminGroupRoutes = router;