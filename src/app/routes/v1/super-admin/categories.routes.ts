import { categoryRoutes } from '@app/modules/commerce/catalog/category/category.routes.js';
import { Router } from "express";

const router = Router();

router.use("/", categoryRoutes);

export default router;