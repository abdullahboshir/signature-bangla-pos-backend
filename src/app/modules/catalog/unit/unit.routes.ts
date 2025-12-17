import { Router } from "express";
import type { AnyZodObject } from "zod/v3";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import { UnitController } from "./unit.controller.ts";
import { UnitValidations } from "./unit.validation.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";

const router = Router();

router.post(
    "/",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(UnitValidations.createUnitValidationSchema as unknown as AnyZodObject),
    UnitController.create
);

router.get("/", auth(USER_ROLE.SUPER_ADMIN), UnitController.getAll);

router.get("/:id", auth(USER_ROLE.SUPER_ADMIN), UnitController.getById);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(UnitValidations.updateUnitValidationSchema as unknown as AnyZodObject),
    UnitController.update
);

router.delete("/:id", auth(USER_ROLE.SUPER_ADMIN), UnitController.delete);

export const UnitRoutes = router;
