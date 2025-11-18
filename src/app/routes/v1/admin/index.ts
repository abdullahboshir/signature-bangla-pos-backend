import { Router } from "express";
import usersRoutes from "./users.routes.js";
// import vendorsRoutes from "./vendors.routes.js";
// import productsRoutes from "./products.routes.js";
import categoriesRoutes from "./categories.routes.js";
import { storesRoutes } from "./stores.routes.js";
// import { vendorsRoutes } from "./vendors.routes.js";
// import ordersRoutes from "./orders.routes.js";
// import analyticsRoutes from "./analytics.routes.js";
// import systemRoutes from "./system.routes.js";
// import disputesRoutes from "./disputes.routes.js";
// import reportsRoutes from "./reports.routes.js";

const router = Router();

router.use("/users", usersRoutes);
router.use("/stores", storesRoutes);
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