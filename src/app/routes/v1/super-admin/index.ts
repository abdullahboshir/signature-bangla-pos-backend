import { Router } from "express";

;
import orderRoutes from "../../../modules/sales/order/order.routes.js";
import { productRoutes } from "@app/modules/catalog/product/product-core/product-core-routes.js";
import { UploadRoutes } from "@app/modules/common/upload/upload.routes.js";
import { customerRoutes } from "../../../modules/customer/customer.routes.js";
import { userRoutes } from "../../../modules/iam/user/user.routes.js";

import { roleRoutes } from "../../../modules/iam/role/role.routes.js";

import { permissionRoutes } from "../../../modules/iam/permission/permission.routes.js";

const superAdminRoutes = Router();

superAdminRoutes.use("/products", productRoutes);
superAdminRoutes.use("/upload", UploadRoutes);
superAdminRoutes.use("/orders", orderRoutes); // Registering orders
superAdminRoutes.use("/customers", customerRoutes);
superAdminRoutes.use("/users", userRoutes);
superAdminRoutes.use("/role", roleRoutes);
superAdminRoutes.use("/permission", permissionRoutes);

export const adminGroupRoutes = superAdminRoutes;