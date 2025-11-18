import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { subcategoryZodSchema } from "./sub-category.validation.js";
import { createSubCategoryController, getSubCategoriesController } from "./sub-category.controller.js";
import type { AnyZodObject } from "zod/v3";

const router = Router();


router.post('/create', validateRequest(subcategoryZodSchema as unknown as AnyZodObject), createSubCategoryController)

router.get('/:categoryId/getSubCategories', getSubCategoriesController)

export const subCategoryRoutes = router;