import { Router } from "express";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import { BrandController } from "./brand.controller.ts";
import { BrandValidations } from "./brand.validation.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";

const router = Router();

router.post(
    "/",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(BrandValidations.createBrandValidationSchema),
    BrandController.createBrand
);

router.get("/", auth(USER_ROLE.SUPER_ADMIN), BrandController.getAllBrands);

router.get("/:id", auth(USER_ROLE.SUPER_ADMIN), BrandController.getBrandById);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(BrandValidations.updateBrandValidationSchema),
    BrandController.updateBrand
);

router.delete("/:id", auth(USER_ROLE.SUPER_ADMIN), BrandController.deleteBrand);

export const BrandRoutes = router;
