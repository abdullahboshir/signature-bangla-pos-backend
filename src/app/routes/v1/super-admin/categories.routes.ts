import { categoryRoutes } from '@app/modules/catalog/category/category.routes.ts';
import { Router } from "express";

const router = Router();

router.use("/", categoryRoutes);

export default router;