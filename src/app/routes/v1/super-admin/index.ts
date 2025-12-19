import { Router } from "express";

;
import orderRoutes from "../../../modules/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/catalog/product/product-core/product-core-routes.js";
import { UploadRoutes } from "@app/modules/common/upload/upload.routes.js";
import { customerRoutes } from "../../../modules/customer/customer.routes.js";
import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";
import { businessUnitRoutes } from "@app/modules/organization/business-unit/business-unit.routes.ts";

// Catalog Imports
import { categoryRoutes } from "@app/modules/catalog/category/category.routes.js";
import { subCategoryRoutes } from "@app/modules/catalog/sub-category/sub-category.routes.js";
import { childCategoryRoutes } from "@app/modules/catalog/child-category/child-category.routes.js";
import { BrandRoutes } from "@app/modules/catalog/brand/brand.routes.js";
import { UnitRoutes } from "@app/modules/catalog/unit/unit.routes.js";
import { TaxRoutes } from "@app/modules/catalog/tax/tax.routes.ts";
import { attributeRoutes } from "@app/modules/catalog/attribute/attribute.routes.js";

// Inventory & Supplier Imports
import { SupplierRoutes } from "@app/modules/suppliers/supplier/supplier.routes.js";
import { PurchaseRoutes } from "@app/modules/inventory/purchase/purchase.routes.js";

const superAdminRoutes = Router();

superAdminRoutes.use("/products", productRoutes);
superAdminRoutes.use("/upload", UploadRoutes);
superAdminRoutes.use("/orders", orderRoutes); // Registering orders
superAdminRoutes.use("/customers", customerRoutes);
superAdminRoutes.use("/users", userRoutes);
superAdminRoutes.use("/role", roleRoutes);
superAdminRoutes.use("/permission", permissionRoutes);
superAdminRoutes.use("/business-unit", businessUnitRoutes);

// Catalog Mounts
superAdminRoutes.use("/categories/sub", subCategoryRoutes);
superAdminRoutes.use("/categories/child", childCategoryRoutes);
superAdminRoutes.use("/categories", categoryRoutes);
superAdminRoutes.use("/brands", BrandRoutes);
superAdminRoutes.use("/units", UnitRoutes);
superAdminRoutes.use("/taxes", TaxRoutes);
superAdminRoutes.use("/attributes", attributeRoutes);

// Inventory & Supplier Mounts
superAdminRoutes.use("/suppliers", SupplierRoutes);
superAdminRoutes.use("/purchases", PurchaseRoutes);

export const adminGroupRoutes = superAdminRoutes;