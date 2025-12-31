import { Schema, Types, model } from "mongoose";
import type { IBusinessUnitAnalyticsDocument, IBusinessUnitAnalyticsSummaryDocument, IBusinessUnitAnalyticsSummaryModel } from "./analytics.interface.js";


// ==================== BUSINESS UNIT ANALYTICS MODEL ====================
const businessUnitAnalyticsSchema = new Schema<IBusinessUnitAnalyticsDocument>({
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
  date: { type: Date, required: true, default: Date.now },
  period: {
    type: String,
    enum: ["hourly", "daily", "weekly", "monthly"],
    required: true
  },

  // Traffic Analytics
  traffic: {
    sessions: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0, min: 0, max: 100 },
    averageSessionDuration: { type: Number, default: 0 },
    pagesPerSession: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 }
  },

  // Sales Analytics
  sales: {
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0, min: 0, max: 100 },
    abandonedCarts: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    returns: { type: Number, default: 0 }
  },

  // Product Analytics
  products: {
    views: { type: Number, default: 0 },
    addToCarts: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    topProducts: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      views: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    outOfStockViews: { type: Number, default: 0 }
  },

  // Customer Analytics
  customers: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    customerAcquisitionCost: { type: Number, default: 0 },
    customerLifetimeValue: { type: Number, default: 0 },
    retentionRate: { type: Number, default: 0, min: 0, max: 100 },
    churnRate: { type: Number, default: 0, min: 0, max: 100 }
  },

  // Marketing Analytics
  marketing: {
    trafficSources: {
      direct: { type: Number, default: 0 },
      organic: { type: Number, default: 0 },
      referral: { type: Number, default: 0 },
      social: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      paid: { type: Number, default: 0 }
    },
    campaignPerformance: [{
      campaign: { type: String, required: true },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }]
  },

  // Geographic Analytics
  geographic: {
    countries: [{
      country: { type: String, required: true },
      visitors: { type: Number, default: 0 },
      orders: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 }
    }],
    cities: [{
      city: { type: String, required: true },
      country: { type: String, required: true },
      visitors: { type: Number, default: 0 }
    }]
  },

  // Device Analytics
  devices: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    conversionRateByDevice: {
      desktop: { type: Number, default: 0, min: 0, max: 100 },
      mobile: { type: Number, default: 0, min: 0, max: 100 },
      tablet: { type: Number, default: 0, min: 0, max: 100 }
    }
  }
}, {
  timestamps: true
});

// Indexes
businessUnitAnalyticsSchema.index({ businessUnit: 1, date: 1, period: 1 }, { unique: true });
businessUnitAnalyticsSchema.index({ date: -1 });
businessUnitAnalyticsSchema.index({ period: 1 });
businessUnitAnalyticsSchema.index({ "sales.revenue": -1 });
businessUnitAnalyticsSchema.index({ "traffic.sessions": -1 });

export const BusinessUnitAnalytics = model<IBusinessUnitAnalyticsDocument>('BusinessUnitAnalytics', businessUnitAnalyticsSchema);

// ==================== STORE ANALYTICS SUMMARY MODEL ====================
const businessUnitAnalyticsSummarySchema = new Schema<IBusinessUnitAnalyticsSummaryDocument, IBusinessUnitAnalyticsSummaryModel>({
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
  period: {
    type: String,
    enum: ["weekly", "monthly", "quarterly", "yearly"],
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  // Performance Summary
  performance: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0, min: 0, max: 100 },
    customerRetentionRate: { type: Number, default: 0, min: 0, max: 100 }
  },

  // Growth Metrics
  growth: {
    revenueGrowth: { type: Number, default: 0 },
    orderGrowth: { type: Number, default: 0 },
    customerGrowth: { type: Number, default: 0 },
    trafficGrowth: { type: Number, default: 0 }
  },

  // Top Performers
  topPerformers: {
    products: [{
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      revenue: { type: Number, default: 0 },
      unitsSold: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0, min: 0, max: 100 }
    }],
    categories: [{
      category: { type: Schema.Types.ObjectId, ref: 'Category' },
      revenue: { type: Number, default: 0 },
      orders: { type: Number, default: 0 }
    }]
  },

  // Customer Insights
  customerInsights: {
    averageCustomerValue: { type: Number, default: 0 },
    repeatPurchaseRate: { type: Number, default: 0, min: 0, max: 100 },
    acquisitionCost: { type: Number, default: 0 },
    lifetimeValue: { type: Number, default: 0 },
    demographics: {
      ageGroups: { type: Map, of: Number },
      gender: {
        male: { type: Number, default: 0 },
        female: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
      }
    }
  },

  // Business Insights
  businessInsights: {
    bestSellingTime: { type: String },
    peakSalesDay: { type: String },
    mostProfitableCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    inventoryTurnover: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0, min: -100, max: 100 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
businessUnitAnalyticsSummarySchema.index({ outlet: 1, period: 1, startDate: 1 }, { unique: true });
businessUnitAnalyticsSummarySchema.index({ period: 1, startDate: 1 });

// Instance Methods
businessUnitAnalyticsSummarySchema.methods['calculateGrowthMetrics'] = async function (this: IBusinessUnitAnalyticsSummaryDocument, previousPeriod: any): Promise<void> {
  if (previousPeriod) {
    this.growth.revenueGrowth = previousPeriod.performance.totalRevenue > 0
      ? ((this.performance.totalRevenue - previousPeriod.performance.totalRevenue) / previousPeriod.performance.totalRevenue) * 100
      : 0;

    this.growth.orderGrowth = previousPeriod.performance.totalOrders > 0
      ? ((this.performance.totalOrders - previousPeriod.performance.totalOrders) / previousPeriod.performance.totalOrders) * 100
      : 0;

    this.growth.customerGrowth = previousPeriod.performance.totalCustomers > 0
      ? ((this.performance.totalCustomers - previousPeriod.performance.totalCustomers) / previousPeriod.performance.totalCustomers) * 100
      : 0;
  }
  await this.save();
};

businessUnitAnalyticsSummarySchema.methods['generateBusinessInsights'] = async function (this: IBusinessUnitAnalyticsSummaryDocument): Promise<void> {
  // This would analyze the data to generate business insights
  // For now, we'll set some placeholder values
  this.businessInsights.bestSellingTime = "14:00-16:00";
  this.businessInsights.peakSalesDay = "Friday";
  this.businessInsights.profitMargin = 25; // 25% profit margin

  await this.save();
};

businessUnitAnalyticsSummarySchema.methods['getPerformanceScore'] = function (this: IBusinessUnitAnalyticsSummaryDocument): number {
  const factors = {
    conversionRate: this.performance.conversionRate * 0.3,
    customerRetention: this.performance.customerRetentionRate * 0.25,
    revenueGrowth: Math.max(0, this.growth.revenueGrowth) * 0.25,
    orderGrowth: Math.max(0, this.growth.orderGrowth) * 0.2
  };

  return Object.values(factors).reduce((sum, score) => sum + score, 0);
};

// Static Methods
businessUnitAnalyticsSummarySchema.statics['generateBusinessUnitReport'] = async function (
  this: IBusinessUnitAnalyticsSummaryModel,
  outletId: Types.ObjectId,
  period: string
): Promise<IBusinessUnitAnalyticsSummaryDocument> {
  const endDate = new Date();
  let startDate = new Date();

  switch (period) {
    case 'weekly':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'quarterly':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case 'yearly':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  // Aggregate data from BusinessUnitAnalytics
  const analyticsData = await BusinessUnitAnalytics.aggregate([
    {
      $match: {
        businessUnit: outletId,
        date: { $gte: startDate, $lte: endDate },
        period: 'daily'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$sales.revenue' },
        totalOrders: { $sum: '$sales.orders' },
        totalCustomers: { $sum: '$customers.newCustomers' },
        totalSessions: { $sum: '$traffic.sessions' },
        averageConversion: { $avg: '$sales.conversionRate' }
      }
    }
  ]);

  const summaryData = analyticsData[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSessions: 0,
    averageConversion: 0
  };

  const summary = await this.findOneAndUpdate(
    { outlet: outletId, period, startDate },
    {
      outlet: outletId,
      period,
      startDate,
      endDate,
      performance: {
        totalRevenue: summaryData.totalRevenue,
        totalOrders: summaryData.totalOrders,
        totalCustomers: summaryData.totalCustomers,
        averageOrderValue: summaryData.totalOrders > 0 ? summaryData.totalRevenue / summaryData.totalOrders : 0,
        conversionRate: summaryData.averageConversion,
        customerRetentionRate: 70 // This would come from customer data
      }
    },
    { upsert: true, new: true }
  );

  if (!summary) {
    throw new Error("Failed to generate or retrieve business unit analytics summary");
  }

  return summary;
};

businessUnitAnalyticsSummarySchema.statics['getBusinessUnitBenchmarks'] = async function (this: IBusinessUnitAnalyticsSummaryModel, outletId: Types.ObjectId): Promise<any> {
  return this.aggregate([
    {
      $match: { outlet: outletId }
    },
    {
      $group: {
        _id: '$period',
        avgRevenue: { $avg: '$performance.totalRevenue' },
        avgOrders: { $avg: '$performance.totalOrders' },
        avgConversion: { $avg: '$performance.conversionRate' },
        performanceScores: { $push: { $multiply: ['$performance.conversionRate', '$performance.customerRetentionRate'] } }
      }
    }
  ]);
};

export const BusinessUnitAnalyticsSummary = model<IBusinessUnitAnalyticsSummaryDocument, IBusinessUnitAnalyticsSummaryModel>('BusinessUnitAnalyticsSummary', businessUnitAnalyticsSummarySchema);