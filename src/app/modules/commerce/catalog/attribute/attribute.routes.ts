import express from "express";
import { AttributeController } from "./attribute.controller.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import { createAttributeZodSchema, updateAttributeZodSchema } from "./attribute.validation.js";
import type { AnyZodObject } from "zod/v3";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.ts";

const router = express.Router();

router.post(
    "/create",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    validateRequest(createAttributeZodSchema as unknown as AnyZodObject),
    AttributeController.create
);

router.get(
    "/",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
    AttributeController.getAll
);

router.get(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
    AttributeController.getById
);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    validateRequest(updateAttributeZodSchema as unknown as AnyZodObject),
    AttributeController.update
);

router.delete(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    AttributeController.delete
);

export const attributeRoutes = router;
