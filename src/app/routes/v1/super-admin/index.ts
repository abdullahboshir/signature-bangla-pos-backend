import { Router } from "express";
import { userGroupRoutes } from "./users.routes.ts";

// import vendorsRoutes from "./vendors.routes.js";
import productsRoutes from "./products.routes.ts";
import categoriesRoutes from "./categories.routes.ts";
import { businessUnitGroupRoutes } from "./business-unit.routes.ts";
import { roleRoutes } from "../../../modules/iam/role/role.routes.ts";
import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.ts";
import { dashboardRoutes } from "./dashboard.routes.ts";

// import { vendorsRoutes } from "./vendors.routes.js";

// import ordersRoutes from "./orders.routes.js";
// import analyticsRoutes from "./analytics.routes.js";
// import systemRoutes from "./system.routes.js";
// import disputesRoutes from "./disputes.routes.js";
// import reportsRoutes from "./reports.routes.js";

import { BrandRoutes } from "@app/modules/catalog/brand/brand.routes.ts";
import { UnitRoutes } from "@app/modules/catalog/unit/unit.routes.ts";
import { TaxRoutes } from "@app/modules/catalog/tax/tax.routes.ts";
import { UploadRoutes } from "@app/modules/common/upload/upload.routes.ts";

const router = Router();

router.use("/users", userGroupRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/business-unit", businessUnitGroupRoutes);
// router.use("/vendors", vendorsRoutes);
router.use("/products", productsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/brands", BrandRoutes);
router.use("/units", UnitRoutes);
router.use("/taxes", TaxRoutes);
router.use("/upload", UploadRoutes);
router.use("/businessUnits", categoriesRoutes);
router.use("/role", roleRoutes);
router.use("/permission", permissionRoutes);
// router.use("/orders", ordersRoutes);
// router.use("/analytics", analyticsRoutes);
// router.use("/system", systemRoutes);
// router.use("/disputes", disputesRoutes);
// router.use("/reports", reportsRoutes);

export const adminGroupRoutes = router;