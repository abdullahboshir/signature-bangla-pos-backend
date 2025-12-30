import type { Request, Response } from 'express';
import catchAsync from '../../../../../../core/utils/catchAsync.js';
import { ApiResponse } from '../../../../../../core/utils/api-response.js';
import httpStatus from 'http-status';
import { ProductReviewService } from './product-reviews.service.js';

const createReview = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user.userId;
    const result = await ProductReviewService.createReview({ ...req.body, user });

    ApiResponse.success(res, result, "Review created successfully", httpStatus.CREATED);
});

const getReviewsForProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductReviewService.getReviewsForProduct(req.params['productId'] as string, req.query);

    ApiResponse.success(res, result, "Reviews retrieved successfully");
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductReviewService.getAllReviews(req.query);

    ApiResponse.success(res, result, "My reviews retrieved successfully");
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductReviewService.updateReviewStatus(req.params['id'] as string, req.body.status);

    ApiResponse.success(
        res,
        result,
        "Review status updated successfully"
    );
});

const replyToReview = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const result = await ProductReviewService.replyToReview(req.params['id'] as string, req.body.response, req.user.userId);

    ApiResponse.success(res, result, "Reply added successfully");
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductReviewService.deleteReview(req.params['id'] as string);

    ApiResponse.success(res, result, "Review deleted successfully");
});

export const ProductReviewController = {
    createReview,
    getReviewsForProduct,
    getProductReviews,
    updateReview,
    replyToReview,
    deleteReview
};
