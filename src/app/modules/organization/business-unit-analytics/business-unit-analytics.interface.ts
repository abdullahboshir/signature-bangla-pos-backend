import type { Document, Model, Types } from "mongoose";

export interface IBusinessUnitAnalytics {
  businessUnit: Types.ObjectId;
  date: Date;
  period: "hourly" | "daily" | "weekly" | "monthly";
  
  // Traffic Analytics
  traffic: {
    sessions: number;
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
    pagesPerSession: number;
    newVisitors: number;
    returningVisitors: number;
  };
  
  // Sales Analytics
  sales: {
    orders: number;
    revenue: number;
    averageOrderValue: number;
    conversionRate: number;
    abandonedCarts: number;
    refunds: number;
    returns: number;
  };
  
  // Product Analytics
  products: {
    views: number;
    addToCarts: number;
    purchases: number;
    topProducts: {
      product: Types.ObjectId;
      views: number;
      sales: number;
      revenue: number;
    }[];
    outOfStockViews: number;
  };
  
  // Customer Analytics
  customers: {
    newCustomers: number;
    returningCustomers: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
    retentionRate: number;
    churnRate: number;
  };
  
  // Marketing Analytics
  marketing: {
    trafficSources: {
      direct: number;
      organic: number;
      referral: number;
      social: number;
      email: number;
      paid: number;
    };
    campaignPerformance: {
      campaign: string;
      clicks: number;
      conversions: number;
      revenue: number;
    }[];
  };
  
  // Geographic Analytics
  geographic: {
    countries: {
      country: string;
      visitors: number;
      orders: number;
      revenue: number;
    }[];
    cities: {
      city: string;
      country: string;
      visitors: number;
    }[];
  };
  
  // Device Analytics
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
    conversionRateByDevice: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IBusinessUnitAnalyticsSummary {
  store: Types.ObjectId;
  period: "weekly" | "monthly" | "quarterly" | "yearly";
  startDate: Date;
  endDate: Date;
  
  // Performance Summary
  performance: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    conversionRate: number;
    customerRetentionRate: number;
  };
  
  // Growth Metrics
  growth: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    trafficGrowth: number;
  };
  
  // Top Performers
  topPerformers: {
    products: {
      product: Types.ObjectId;
      revenue: number;
      unitsSold: number;
      conversionRate: number;
    }[];
    categories: {
      category: Types.ObjectId;
      revenue: number;
      orders: number;
    }[];
  };
  
  // Customer Insights
  customerInsights: {
    averageCustomerValue: number;
    repeatPurchaseRate: number;
    acquisitionCost: number;
    lifetimeValue: number;
    demographics: {
      ageGroups: { [key: string]: number };
      gender: { male: number; female: number; other: number };
    };
  };
  
  // Business Insights
  businessInsights: {
    bestSellingTime: string;
    peakSalesDay: string;
    mostProfitableCategory: Types.ObjectId;
    inventoryTurnover: number;
    profitMargin: number;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export type IBusinessUnitAnalyticsDocument = IBusinessUnitAnalytics & Document;
export type IBusinessUnitAnalyticsSummaryDocument = IBusinessUnitAnalyticsSummary & Document & {
  calculateGrowthMetrics(previousPeriod: any): Promise<void>;
  generateBusinessInsights(): Promise<void>;
  getPerformanceScore(): number;
};

export interface IBusinessUnitAnalyticsSummaryModel extends Model<IBusinessUnitAnalyticsSummaryDocument> {
  generateBusinessUnitReport(storeId: Types.ObjectId, period: string): Promise<IBusinessUnitAnalyticsSummaryDocument>;
  getBusinessUnitBenchmarks(storeId: Types.ObjectId): Promise<any>;
}