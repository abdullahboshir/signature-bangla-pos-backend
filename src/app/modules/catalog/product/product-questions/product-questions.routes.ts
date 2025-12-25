import express from "express";
import { ProductQAController } from "./product-questions.controller.js";
import auth from "../../../../../core/middleware/auth.js";
import { USER_ROLE } from "../../../../modules/iam/user/user.constant.js";

const router = express.Router();

router.post("/", auth(USER_ROLE.CUSTOMER, USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), ProductQAController.createQuestion);
router.get("/product/:productId", ProductQAController.getQuestionsForProduct);
router.get("/", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPPORT_AGENT), ProductQAController.getAllQuestions);
router.patch("/:id/answer", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), ProductQAController.answerQuestion);
router.patch("/:id/status", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), ProductQAController.updateStatus);
router.delete("/:id", auth(USER_ROLE.SUPER_ADMIN), ProductQAController.deleteQuestion);

export const ProductQARoutes = router;
