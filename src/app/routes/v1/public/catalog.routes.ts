import { productRoutes } from "@app/modules/commerce/catalog/product/domain/product-core/product-core-routes.ts";
import { Router } from "express";



const router = Router();

router.use("/products", productRoutes);

export default router;