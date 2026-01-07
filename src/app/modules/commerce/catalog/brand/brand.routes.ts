import { Router } from "express";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import { BrandController } from "./brand.controller.ts";
import { BrandValidations } from "./brand.validation.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.js";

const router = Router();

router.post(
    "/",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(BrandValidations.createBrandValidationSchema as unknown as AnyZodObject),
    BrandController.create
);

router.get("/", auth(USER_ROLE.SUPER_ADMIN), BrandController.getAll);

router.get("/:id", auth(USER_ROLE.SUPER_ADMIN), BrandController.getById);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(BrandValidations.updateBrandValidationSchema as unknown as AnyZodObject),
    BrandController.update
);

router.delete("/:id", auth(USER_ROLE.SUPER_ADMIN), BrandController.delete);

export const BrandRoutes = router;
