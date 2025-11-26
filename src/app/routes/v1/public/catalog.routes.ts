import { productRoutes } from "@app/modules/catalog/product/product-core/product-core-routes.ts";
import { Router } from "express";



const router = Router();

router.use("/products", productRoutes); 

export default router;