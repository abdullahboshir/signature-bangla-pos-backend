import { categoryRoutes } from '@app/modules/commerce/catalog/category/category.routes.js';
import { childCategoryRoutes } from '@app/modules/commerce/catalog/child-category/child-category.routes.js';
import { subCategoryRoutes } from '@app/modules/commerce/catalog/sub-category/sub-category.routes.js';
import { Router } from "express";



const router = Router();

router.use("/", categoryRoutes);
router.use("/sub", subCategoryRoutes);
router.use("/child", childCategoryRoutes);

export default router;