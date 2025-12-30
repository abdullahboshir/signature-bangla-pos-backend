import { ProductReview } from "./product-reviews.model.js";
import type { IProductReview } from "./product-reviews.interface.js";
import { Types as _Types } from "mongoose";

const createReview = async (payload: IProductReview) => {
    // Note: In a real app, we should check if the user actually purchased the product
    const result = await ProductReview.create(payload);
    return result;
};

const getReviewsForProduct = async (productId: string, query: Record<string, unknown>) => {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const result = await ProductReview.find({
        product: productId,
        status: 'published' // Only show published reviews to public/customers
    })
        .populate('user', 'name') // Assuming user has a name field suitable for public display
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ProductReview.countDocuments({ product: productId, status: 'published' });

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result
    };
};

const getAllReviews = async (query: Record<string, unknown>) => {
    const page = Number(query['page'] || 1);
    const limit = Number(query['limit'] || 10);
    const rating = query['rating'];
    const status = query['status'];

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (rating) {
        filter['rating'] = Number(rating);
    }
    if (status) {
        filter['status'] = status;
    }

    const result = await ProductReview.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ProductReview.countDocuments(filter);

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result
    };
};

const updateReviewStatus = async (id: string, status: "pending" | "published" | "rejected") => {
    const result = await ProductReview.findByIdAndUpdate(id, { status }, { new: true });
    return result;
};

const replyToReview = async (id: string, response: string, userId: string) => {
    const result = await ProductReview.findByIdAndUpdate(
        id,
        {
            sellerResponse: {
                response,
                respondedAt: new Date(),
                respondedBy: userId
            }
        },
        { new: true }
    );
    return result;
};

const deleteReview = async (id: string) => {
    const result = await ProductReview.findByIdAndDelete(id);
    return result;
};

export const ProductReviewService = {
    createReview,
    getReviewsForProduct,
    getAllReviews,
    updateReviewStatus,
    replyToReview,
    deleteReview
};
