import { Router } from "express";
import { CategoryController, getCategoriesByBusinessUnit } from "./category.controller.js";
import { upload } from "@core/utils/file-upload.ts";

const router = Router();

// Note: Using multer middleware for FormData handling (file uploads)
router.post("/create", upload.single('image'), CategoryController.create);
router.get("/", CategoryController.getAll);
router.patch("/:id", upload.single('image'), CategoryController.update);
router.delete("/:id", CategoryController.delete);
// router.patch("/:id/status", /* change category status */);
// router.patch("/:id/order", /* change display order */);

router.get("/:businessUnitId/getCategories", getCategoriesByBusinessUnit);

export const categoryRoutes = router;
