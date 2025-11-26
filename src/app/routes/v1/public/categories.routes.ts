import { categoryRoutes } from "@app/modules/catalog/category/category.routes.ts";
import { childCategoryRoutes } from "@app/modules/catalog/child-category/child-category.routes.ts";
import { subCategoryRoutes } from "@app/modules/catalog/sub-category/sub-category.routes.ts";
import { Router } from "express";



const router = Router();

router.use("/", categoryRoutes); 
router.use("/sub", subCategoryRoutes);
router.use("/child", childCategoryRoutes); 

export default router;