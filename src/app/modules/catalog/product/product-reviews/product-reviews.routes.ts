import express from "express";
import { ProductReviewController } from "./product-reviews.controller.js";
import auth from "../../../../../core/middleware/auth.js";
import { USER_ROLE } from "../../../../modules/iam/user/user.constant.js";

const router = express.Router();

router.post("/", auth(USER_ROLE.CUSTOMER, USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), ProductReviewController.createReview);

router.get(
    "/product/:productId",
    ProductReviewController.getReviewsForProduct
);

router.get("/", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.SUPPORT_AGENT), ProductReviewController.getAllReviews);

router.patch("/:id/status", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN), ProductReviewController.updateStatus);

router.patch("/:id/reply", auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR), ProductReviewController.replyToReview);

router.delete("/:id", auth(USER_ROLE.SUPER_ADMIN), ProductReviewController.deleteReview);

export const ProductReviewRoutes = router;
