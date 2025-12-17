import { Router } from "express";

import type { AnyZodObject } from "zod/v3";
import { childCategoryZodSchema } from "./child-category.validation.js";
import {
  createChildCategoryController,
  getChildCategoriesController,
  getAllChildCategoriesController,
  ChildCategoryController
} from "./child-category.controller.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.post(
  "/create",
  validateRequest(childCategoryZodSchema as unknown as AnyZodObject),
  createChildCategoryController
);

router.get("/", ChildCategoryController.getAll);
router.get("/:subCategoryId/getChildCategories", getChildCategoriesController);
router.patch("/:id", ChildCategoryController.update);
router.delete("/:id", ChildCategoryController.delete);
export const childCategoryRoutes = router;
