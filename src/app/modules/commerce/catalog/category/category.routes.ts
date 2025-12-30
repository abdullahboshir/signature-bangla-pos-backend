import { Router } from "express";

import { categoryZodSchema } from "./category.validation.js";
import { CategoryController, getCategoriesByBusinessUnit } from "./category.controller.js";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = Router();

router.post(
  "/create",
  validateRequest(categoryZodSchema as unknown as AnyZodObject),
  CategoryController.create
);
router.get("/", CategoryController.getAll);
router.patch("/:id", CategoryController.update);
router.delete("/:id", CategoryController.delete);
// router.patch("/:id/status", /* change category status */);
// router.patch("/:id/order", /* change display order */);

router.get("/:businessUnitId/getCategories", getCategoriesByBusinessUnit);

export const categoryRoutes = router;
