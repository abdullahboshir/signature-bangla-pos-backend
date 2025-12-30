import { Schema, model } from "mongoose";
import type { IProductAnalytics, IProductAnalyticsSummaryDocument } from "./product-analytics.interface.js";


// ==================== DAILY ANALYTICS SCHEMA ====================

const productAnalyticsSchema = new Schema<IProductAnalytics>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  date: { type: Date, required: true, default: Date.now },
  
  // Daily Metrics
  views: { type: Number, default: 0, min: 0 },
  uniqueViews: { type: Number, default: 0, min: 0 },
  cartAdds: { type: Number, default: 0, min: 0 },
  wishlistAdds: { type: Number, default: 0, min: 0 },
  purchases: { type: Number, default: 0, min: 0 },
  revenue: { type: Number, default: 0, min: 0 },
  returns: { type: Number, default: 0, min: 0 },
  refunds: { type: Number, default: 0, min: 0 },
  
  // Performance Metrics
  conversionRate: { type: Number, default: 0, min: 0, max: 100 },
  bounceRate: { type: Number, default: 0, min: 0, max: 100 },
  averageSessionDuration: { type: Number, default: 0, min: 0 } // in seconds
}, {
  timestamps: true
});

// ==================== ANALYTICS SUMMARY SCHEMA ====================

const productAnalyticsSummarySchema = new Schema<IProductAnalyticsSummaryDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  
  // Lifetime Metrics
  totalViews: { type: Number, default: 0, min: 0 },
  totalPurchases: { type: Number, default: 0, min: 0 },
  totalRevenue: { type: Number, default: 0, min: 0 },
  totalReturns: { type: Number, default: 0, min: 0 },
  
  // Performance Averages
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  conversionRate: { type: Number, default: 0, min: 0, max: 100 },
  returnRate: { type: Number, default: 0, min: 0, max: 100 },
  
  // Time-based Metrics
  dailyAverage: {
    views: { type: Number, default: 0, min: 0 },
    purchases: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 }
  }
}, {
  timestamps: true
});

// ==================== ANALYTICS STATIC METHODS ====================

productAnalyticsSchema.statics['updateProductSummary'] = async function(productId: Schema.Types.ObjectId): Promise<void> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [lifetimeStats, recentStats] = await Promise.all([
    // Lifetime statistics
    this.aggregate([
      { $match: { product: productId } },
      {
        $group: {
          _id: '$product',
          totalViews: { $sum: '$views' },
          totalPurchases: { $sum: '$purchases' },
          totalRevenue: { $sum: '$revenue' },
          totalReturns: { $sum: '$returns' },
          averageConversion: { $avg: '$conversionRate' },
          averageReturn: { $avg: '$returnRate' }
        }
      }
    ]),
    
    // Recent 30-day statistics for daily averages
    this.aggregate([
      { 
        $match: { 
          product: productId,
          date: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: '$product',
          dailyViews: { $avg: '$views' },
          dailyPurchases: { $avg: '$purchases' },
          dailyRevenue: { $avg: '$revenue' }
        }
      }
    ])
  ]);
  
  const lifetime = lifetimeStats[0] || {};
  const recent = recentStats[0] || {};
  
  // Get average rating from reviews summary
  const reviewsSummary = await model('ProductReviewsSummary').findOne({ product: productId });
  const averageRating = reviewsSummary?.ratingSummary.average || 0;
  
  await ProductAnalyticsSummary.findOneAndUpdate(
    { product: productId },
    {
      totalViews: lifetime.totalViews || 0,
      totalPurchases: lifetime.totalPurchases || 0,
      totalRevenue: lifetime.totalRevenue || 0,
      totalReturns: lifetime.totalReturns || 0,
      averageRating,
      conversionRate: lifetime.averageConversion || 0,
      returnRate: lifetime.averageReturn || 0,
      dailyAverage: {
        views: recent.dailyViews || 0,
        purchases: recent.dailyPurchases || 0,
        revenue: recent.dailyRevenue || 0
      }
    },
    { upsert: true, new: true }
  );
};

// ==================== ANALYTICS MIDDLEWARE ====================

productAnalyticsSchema.post('save', async function() {
  await (this.constructor as any).updateProductSummary(this.product);
});

// ==================== ANALYTICS SUMMARY METHODS ====================

productAnalyticsSummarySchema.methods['calculateProfit'] = function(costPercentage: number = 0.6): number {
  return this['totalRevenue'] * (1 - costPercentage);
};

productAnalyticsSummarySchema.methods['getPerformanceScore'] = function(): number {
  const factors = {
    conversionRate: this['conversionRate'] * 0.3,
    averageRating: (this['averageRating'] / 5) * 100 * 0.4,
    returnRate: (100 - this['returnRate']) * 0.3
  };
  
  return Object.values(factors).reduce((sum, score) => sum + score, 0);
};

// ==================== INDEXES ====================

productAnalyticsSchema.index({ product: 1, date: 1 }, { unique: true });
productAnalyticsSchema.index({ date: 1 });
productAnalyticsSchema.index({ product: 1, createdAt: -1 });

productAnalyticsSummarySchema.index({ product: 1 });
productAnalyticsSummarySchema.index({ totalRevenue: -1 });
productAnalyticsSummarySchema.index({ conversionRate: -1 });

export const ProductAnalytics = model<IProductAnalytics>('ProductAnalytics', productAnalyticsSchema);
export const ProductAnalyticsSummary = model<IProductAnalyticsSummaryDocument>('ProductAnalyticsSummary', productAnalyticsSummarySchema);