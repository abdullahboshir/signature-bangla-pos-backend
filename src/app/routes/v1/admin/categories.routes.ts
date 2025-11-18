import { Router } from "express";
import { categoryRoutes } from "../../../modules/category/category.routes.js";
import { subCategoryRoutes } from "../../../modules/sub-category/sub-category.routes.js";
import { childCategoryRoutes } from "../../../modules/child-category/child-category.routes.js";


const router = Router();

router.use("/", categoryRoutes);
router.use("/sub", subCategoryRoutes);
router.use("/child", childCategoryRoutes); 

export default router;