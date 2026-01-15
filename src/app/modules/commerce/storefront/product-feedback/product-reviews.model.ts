import { Schema, Types, model } from "mongoose";

import type { IProductReview, IProductReviewsSummaryDocument } from "./product-reviews.interface.ts";
import { RatingDistributionSchema } from "@app/modules/catalog/product/product-shared/product-shared.model.ts";


// ==================== REVIEW SCHEMA ====================

const productReviewSchema = new Schema<IProductReview>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },

  // Review Content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5'
    }
  },
  title: { type: String, maxlength: 200 },
  comment: { type: String, required: true, maxlength: 2000 },
  images: [{ type: String }],
  videos: [{ type: String }],

  // Verification & Moderation
  isVerifiedPurchase: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "flagged"],
    default: "pending"
  },
  moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },

  // Engagement
  helpfulCount: { type: Number, default: 0, min: 0 },
  reportCount: { type: Number, default: 0, min: 0 },
  userReaction: {
    type: String,
    enum: ["helpful", "unhelpful"]
  },

  // Seller Response
  sellerResponse: {
    message: { type: String, maxlength: 1000 },
    respondedAt: { type: Date },
    responderId: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
});

// ==================== REVIEWS SUMMARY SCHEMA ====================

const productReviewsSummarySchema = new Schema<IProductReviewsSummaryDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },

  ratingSummary: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 },
    totalReviews: { type: Number, default: 0, min: 0 },
    verifiedReviews: { type: Number, default: 0, min: 0 },
    distribution: { type: RatingDistributionSchema, default: () => ({}) }
  },

  recentReviews: [{ type: Schema.Types.ObjectId, ref: 'ProductReview' }]
}, {
  timestamps: true
});

// ==================== REVIEW INSTANCE METHODS ====================

productReviewSchema.methods['markHelpful'] = function (): void {
  this['helpfulCount'] += 1;
};

productReviewSchema.methods['markUnhelpful'] = function (): void {
  this['helpfulCount'] = Math.max(0, this['helpfulCount'] - 1);
};

productReviewSchema.methods['report'] = function (): void {
  this['reportCount'] += 1;
  if (this['reportCount'] >= 5) {
    this['status'] = 'flagged';
  }
};

productReviewSchema.methods['addSellerResponse'] = function (message: string, responderId: Schema.Types.ObjectId): void {
  this['sellerResponse'] = {
    message,
    responderId,
    respondedAt: new Date()
  };
};

// ==================== REVIEW STATIC METHODS ====================

productReviewSchema.statics['updateProductRatingSummary'] = async function (productId: Schema.Types.ObjectId): Promise<void> {
  const reviews = await this['find']({
    product: productId,
    status: 'approved'
  });

  if (reviews.length === 0) return;

  const totalReviews = reviews.length;
  const verifiedReviews = reviews.filter((r: IProductReview) => r.isVerifiedPurchase).length;
  const averageRating = reviews.reduce((sum: number, r: IProductReview) => sum + r.rating, 0) / totalReviews;

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review: IProductReview) => {
    distribution[review.rating as keyof typeof distribution]++;
  });

  const helpfulVotes = reviews.reduce((sum: number, r: IProductReview) => sum + r.helpfulCount, 0);

  await ProductReviewsSummary.findOneAndUpdate(
    { product: productId },
    {
      ratingSummary: {
        average: Math.round(averageRating * 10) / 10,
        count: totalReviews,
        totalReviews,
        verifiedReviews,
        distribution,
        helpfulVotes
      },
      recentReviews: reviews.slice(-10).map((r: Types.ObjectId) => r._id)
    },
    { upsert: true, new: true }
  );
};

// ==================== REVIEW MIDDLEWARE ====================

productReviewSchema.post('save', async function () {
  if (this['status'] === 'approved') {
    await (this['constructor'] as any).updateProductRatingSummary(this['product']);
  }
});

productReviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && doc.status === 'approved') {
    await (doc.constructor as any).updateProductRatingSummary(doc.product);
  }
});

// ==================== REVIEWS SUMMARY METHODS ====================

productReviewsSummarySchema.methods['getRatingPercentage'] = function (rating: number): number {
  const total = this['ratingSummary'].count;
  if (total === 0) return 0;
  return (this['ratingSummary'].distribution[rating as keyof typeof this.ratingSummary.distribution] / total) * 100;
};

// ==================== INDEXES ====================

productReviewSchema.index({ product: 1, createdAt: -1 });
productReviewSchema.index({ userId: 1, product: 1 }, { unique: true });
productReviewSchema.index({ status: 1, createdAt: -1 });
productReviewSchema.index({ rating: 1 });
productReviewSchema.index({ isVerifiedPurchase: 1 });
productReviewSchema.index({ moderatedBy: 1 });


productReviewsSummarySchema.index({ 'ratingSummary.average': -1 });
productReviewsSummarySchema.index({ 'ratingSummary.count': -1 });

export const ProductReview = model<IProductReview>('ProductReview', productReviewSchema);
export const ProductReviewsSummary = model<IProductReviewsSummaryDocument>('ProductReviewsSummary', productReviewsSummarySchema);