import { Router } from "express";
import { CategoryController, getCategoriesByBusinessUnit } from "./category.controller.ts";
import { upload } from "@core/utils/file-upload.ts";
import { authorize } from "@core/middleware/authorize.ts";
import contextGuard from "@app/middlewares/contextGuard.ts";
import { resourceOwnerGuard } from "@app/middlewares/resourceOwnerGuard.ts";
import { Category } from "./category.model.ts";
import { PermissionActionObj, PermissionSourceObj } from "@app/modules/iam/index.js";

const router = Router();

// Apply Security Layer for all Category Operations (Context Awareness)
router.use(contextGuard());

// Note: Using multer middleware for FormData handling (file uploads)
router.post("/create",
    authorize(PermissionSourceObj.category, PermissionActionObj.create),
    upload.single('image'),
    CategoryController.create
);

router.get("/",
    authorize(PermissionSourceObj.category, PermissionActionObj.view),
    CategoryController.getAll
);

router.get("/:id",
    authorize(PermissionSourceObj.category, PermissionActionObj.view),
    resourceOwnerGuard(Category),
    CategoryController.getById
);

router.patch("/:id",
    authorize(PermissionSourceObj.category, PermissionActionObj.update),
    resourceOwnerGuard(Category),
    upload.single('image'),
    CategoryController.update
);

router.delete("/:id",
    authorize(PermissionSourceObj.category, PermissionActionObj.delete),
    resourceOwnerGuard(Category),
    CategoryController.delete
);
// router.patch("/:id/status", /* change category status */);
// router.patch("/:id/order", /* change display order */);

router.get("/:businessUnitId/getCategories", getCategoriesByBusinessUnit);

export const categoryRoutes = router;
