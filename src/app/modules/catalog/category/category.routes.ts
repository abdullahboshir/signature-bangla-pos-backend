import { Router } from "express";

import { categoryZodSchema } from "./category.validation.js";
import {
  createCategoryController,
  getCategoriesController,
} from "./category.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.post(
  "/create",
  validateRequest(categoryZodSchema as unknown as AnyZodObject),
  createCategoryController
);
router.get("/", getCategoriesController);
// router.put("/:id", /* update category */);
// router.delete("/:id", /* delete category */);
// router.patch("/:id/status", /* change category status */);
// router.patch("/:id/order", /* change display order */);

router.get("/:businessUnitId/getCategories", getCategoriesController);

export const categoryRoutes = router;
