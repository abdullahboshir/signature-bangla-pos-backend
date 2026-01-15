import express from "express";
import { ProductQAController } from "./product-questions.controller.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.ts";

const router = express.Router();

// Public routes
router.get('/:productId', ProductQAController.getQuestions);

// Protected routes
router.post('/', auth(USER_ROLE.CUSTOMER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductQAController.createQuestion);
router.patch('/:id', auth(USER_ROLE.CUSTOMER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductQAController.updateQuestion);
router.patch('/:id/status', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductQAController.updateStatus);
router.delete('/:id', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductQAController.deleteQuestion);

export const ProductQARoutes = router;
