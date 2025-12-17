import { Router } from "express";

import { subcategoryZodSchema } from "./sub-category.validation.js";
import {
  createSubCategoryController,
  getSubCategoriesController,
  getAllSubCategoriesController,
  SubCategoryController
} from "./sub-category.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.post(
  "/create",
  validateRequest(subcategoryZodSchema as unknown as AnyZodObject),
  createSubCategoryController
);

router.get("/", SubCategoryController.getAll);
router.get("/:categoryId/getSubCategories", getSubCategoriesController);
router.patch("/:id", SubCategoryController.update);
router.delete("/:id", SubCategoryController.delete);
export const subCategoryRoutes = router;
