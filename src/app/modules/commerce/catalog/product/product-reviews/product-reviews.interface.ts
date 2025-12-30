import type { Document, Types } from "mongoose";
import type { RatingDistribution } from "../product-shared/product-shared.interface.js";


export interface IProductReview {
  product: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  
  // Review Content
  rating: number;
  title?: string;
  comment: string;
  images: string[];
  videos?: string[];
  
  // Verification & Moderation
  isVerifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected" | "flagged";
  moderatedBy?: Types.ObjectId;
  moderatedAt?: Date;
  
  // Engagement
  helpfulCount: number;
  reportCount: number;
  userReaction?: "helpful" | "unhelpful";
  
  // Seller Response
  sellerResponse?: {
    message: string;
    respondedAt: Date;
    responderId: Types.ObjectId;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductReviewsSummary {
  product: Types.ObjectId;
  
  ratingSummary: {
    average: number;
    count: number;
    totalReviews: number;
    verifiedReviews: number;
    distribution: RatingDistribution;
  };
  
  recentReviews: Types.ObjectId[];
  updatedAt: Date;
}

export type IProductReviewsSummaryDocument = IProductReviewsSummary & Document;