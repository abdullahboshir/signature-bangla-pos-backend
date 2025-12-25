import express from "express";

import { ExpenseCategoryValidation } from "./expense-category.validation.js";
import { ExpenseCategoryController } from "./expense-category.controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = express.Router();

router.post(
    "/",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    validateRequest(ExpenseCategoryValidation.createExpenseCategoryZodSchema),
    ExpenseCategoryController.createExpenseCategory
);

router.get(
    "/",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER, USER_ROLE.STAFF),
    ExpenseCategoryController.getAllExpenseCategories
);

router.get(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    ExpenseCategoryController.getExpenseCategoryById
);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    validateRequest(ExpenseCategoryValidation.updateExpenseCategoryZodSchema),
    ExpenseCategoryController.updateExpenseCategory
);

router.delete(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    ExpenseCategoryController.deleteExpenseCategory
);

export const ExpenseCategoryRoutes = router;
