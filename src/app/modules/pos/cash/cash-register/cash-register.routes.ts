import express from "express";

import { CashRegisterValidation } from "./cash-register.validation.js";
import { CashRegisterController } from "./cash-register.controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = express.Router();

router.post(
    "/open",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.STAFF),
    validateRequest(CashRegisterValidation.openRegisterZodSchema),
    CashRegisterController.openRegister
);

router.post(
    "/:id/close",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.STAFF),
    validateRequest(CashRegisterValidation.closeRegisterZodSchema),
    CashRegisterController.closeRegister
);

router.get(
    "/active",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.STAFF),
    CashRegisterController.getMyActiveRegister
);

router.get(
    "/",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    CashRegisterController.getAllRegisters
);

router.get(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    CashRegisterController.getRegisterById
);

export const CashRegisterRoutes = router;
