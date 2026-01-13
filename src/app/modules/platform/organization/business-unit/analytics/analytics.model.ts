import { Schema, model } from "mongoose";
import type { IBusinessUnitAnalyticsDocument, IBusinessUnitAnalyticsSummaryDocument, IBusinessUnitAnalyticsSummaryModel } from "./analytics.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

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

export const BusinessUnitAnalyticsSummary = model<IBusinessUnitAnalyticsSummaryDocument, IBusinessUnitAnalyticsSummaryModel>('BusinessUnitAnalyticsSummary', businessUnitAnalyticsSummarySchema);

// Apply Context-Aware Data Isolation
businessUnitAnalyticsSchema.plugin(contextScopePlugin, {
  businessUnitField: 'businessUnit'
});

businessUnitAnalyticsSummarySchema.plugin(contextScopePlugin, {
  outletField: 'outlet'
});
