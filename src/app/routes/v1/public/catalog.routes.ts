
import { productRoutes } from "@app/modules/catalog/product/domain/product-core/product.routes.ts";
import { Router } from "express";



const router = Router();

router.use("/products", productRoutes);

export default router;