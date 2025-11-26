import { Router } from "express";

import type { AnyZodObject } from "zod/v3";
import { childCategoryZodSchema } from "./child-category.validation.js";
import {
  createChildCategoryController,
  getChildCategoriesController,
} from "./child-category.controller.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.post(
  "/create",
  validateRequest(childCategoryZodSchema as unknown as AnyZodObject),
  createChildCategoryController
);

router.get("/:subCategoryId/getChildCategories", getChildCategoriesController);

export const childCategoryRoutes = router;
