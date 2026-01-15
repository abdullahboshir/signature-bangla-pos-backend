import express from "express";
import { ProductReviewController } from "./product-reviews.controller.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.ts";


const router = express.Router();

// Public routes
router.get('/:productId', ProductReviewController.getReviewsForProduct);

// Protected routes
router.post('/', auth(USER_ROLE.CUSTOMER), ProductReviewController.createReview);
router.get('/', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductReviewController.getProductReviews);
router.patch('/:id', auth(USER_ROLE.CUSTOMER, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductReviewController.updateReview);
router.post('/:id/reply', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductReviewController.replyToReview); // Changed patch to post for reply if logical, or keep patch
router.delete('/:id', auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN), ProductReviewController.deleteReview);

export const ProductReviewRoutes = router;
