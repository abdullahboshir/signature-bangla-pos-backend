import express from "express";

import { ExpenseValidation } from "./expense.validation.js";
import { ExpenseController } from "./expense.controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/user/user.constant.js";
import { validateRequest } from "@core/middleware/validateRequest.ts";

const router = express.Router();

router.post(
    "/create",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    validateRequest(ExpenseValidation.createExpenseZodSchema),
    ExpenseController.createExpense
);

router.get(
    "/",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    ExpenseController.getAllExpenses
);

router.get(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    ExpenseController.getExpenseById
);

router.patch(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    validateRequest(ExpenseValidation.updateExpenseZodSchema),
    ExpenseController.updateExpense
);

router.delete(
    "/:id",
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
    ExpenseController.deleteExpense
);

export const ExpenseRoutes = router;
