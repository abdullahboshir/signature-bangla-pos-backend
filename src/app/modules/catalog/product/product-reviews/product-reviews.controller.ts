import catchAsync from "../../../../../core/utils/catchAsync.js";
import { ApiResponse } from "../../../../../core/utils/api-response.js";
import { ProductReviewService } from "./product-reviews.service.js";
import httpStatus from "http-status";

const createReview = catchAsync(async (req, res) => {
    // @ts-ignore
    const user = req.user.userId;
    const result = await ProductReviewService.createReview({ ...req.body, user });

    ApiResponse.success(
        res,
        result,
        "Review submitted successfully",
        httpStatus.CREATED
    );
});

const getReviewsForProduct = catchAsync(async (req, res) => {
    const result = await ProductReviewService.getReviewsForProduct(req.params['productId'] as string, req.query);

    ApiResponse.success(
        res,
        result,
        "Reviews retrieved successfully"
    );
});

const getAllReviews = catchAsync(async (req, res) => {
    const result = await ProductReviewService.getAllReviews(req.query);

    ApiResponse.success(
        res,
        result,
        "All reviews retrieved successfully"
    );
});

const updateStatus = catchAsync(async (req, res) => {
    const result = await ProductReviewService.updateReviewStatus(req.params['id'] as string, req.body.status);

    ApiResponse.success(
        res,
        result,
        "Review status updated successfully"
    );
});

const replyToReview = catchAsync(async (req, res) => {
    // @ts-ignore
    const result = await ProductReviewService.replyToReview(req.params['id'] as string, req.body.response, req.user.userId);

    ApiResponse.success(
        res,
        result,
        "Reply added successfully"
    );
});

const deleteReview = catchAsync(async (req, res) => {
    const result = await ProductReviewService.deleteReview(req.params['id'] as string);

    ApiResponse.success(
        res,
        result,
        "Review deleted successfully"
    );
});

export const ProductReviewController = {
    createReview,
    getReviewsForProduct,
    getAllReviews,
    updateStatus,
    replyToReview,
    deleteReview
};
