import type { Document, Types } from "mongoose";

export interface IProductAnalytics {
  product: Types.ObjectId;
  date: Date;
  
  // Daily Metrics
  views: number;
  uniqueViews: number;
  cartAdds: number;
  wishlistAdds: number;
  purchases: number;
  revenue: number;
  returns: number;
  refunds: number;
  
  // Performance Metrics
  conversionRate: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface IProductAnalyticsSummary {
  product: Types.ObjectId;
  
  // Lifetime Metrics
  totalViews: number;
  totalPurchases: number;
  totalRevenue: number;
  totalReturns: number;
  
  // Performance Averages
  averageRating: number;
  conversionRate: number;
  returnRate: number;
  
  // Time-based Metrics
  dailyAverage: {
    views: number;
    purchases: number;
    revenue: number;
  };
  
  lastUpdated: Date;
}

export type IProductAnalyticsSummaryDocument = IProductAnalyticsSummary & Document;