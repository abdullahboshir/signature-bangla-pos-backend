import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { categoryZodSchema } from "./category.validation.js";
import { createCategoryController, getCategoriesController } from "./category.controller.js";
import type { AnyZodObject } from "zod/v3";

const router = Router();


router.post('/create', validateRequest(categoryZodSchema as unknown as AnyZodObject), createCategoryController)
router.get('/', getCategoriesController)
// router.put("/:id", /* update category */);
// router.delete("/:id", /* delete category */);
// router.patch("/:id/status", /* change category status */);
// router.patch("/:id/order", /* change display order */);


router.get('/:departmentId/getCategories', getCategoriesController)


export const categoryRoutes = router;