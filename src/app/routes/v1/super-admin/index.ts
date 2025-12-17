import { Router } from "express";

;
import orderRoutes from "../../../modules/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/catalog/product/product-core/product-core-routes.js";
import { UploadRoutes } from "@app/modules/common/upload/upload.routes.js";
import { customerRoutes } from "../../../modules/customer/customer.routes.js";
import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";

// Catalog Routes
import { categoryRoutes } from "@app/modules/catalog/category/category.routes.js";
import { subCategoryRoutes } from "@app/modules/catalog/sub-category/sub-category.routes.js";
import { childCategoryRoutes } from "@app/modules/catalog/child-category/child-category.routes.js";
import { BrandRoutes } from "@app/modules/catalog/brand/brand.routes.js";
import { UnitRoutes } from "@app/modules/catalog/unit/unit.routes.js";
// import { TaxRoutes } from "@app/modules/catalog/tax/tax.routes.js"; // Assuming exists

const superAdminRoutes = Router();

superAdminRoutes.use("/products", productRoutes);
superAdminRoutes.use("/upload", UploadRoutes);
superAdminRoutes.use("/orders", orderRoutes); // Registering orders
superAdminRoutes.use("/customers", customerRoutes);
superAdminRoutes.use("/users", userRoutes);
superAdminRoutes.use("/role", roleRoutes);
superAdminRoutes.use("/permission", permissionRoutes);

// Catalog Mounts
superAdminRoutes.use("/categories/sub", subCategoryRoutes);
superAdminRoutes.use("/categories/child", childCategoryRoutes);
superAdminRoutes.use("/categories", categoryRoutes);
superAdminRoutes.use("/brands", BrandRoutes);
superAdminRoutes.use("/units", UnitRoutes);

export const adminGroupRoutes = superAdminRoutes;