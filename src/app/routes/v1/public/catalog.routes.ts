import { productRoutes } from "@app/modules/commerce/catalog/product/product-core/product-core-routes.ts";
import { Router } from "express";



const router = Router();

router.use("/products", productRoutes);

export default router;