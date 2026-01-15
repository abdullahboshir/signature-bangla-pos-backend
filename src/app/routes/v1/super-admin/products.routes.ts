import { Router } from 'express';
import { productRoutes } from "@app/modules/catalog/product/domain/product-core/product.routes.ts";

const router = Router();

// Mount the core product routes
router.use('/', productRoutes);

export default router;
