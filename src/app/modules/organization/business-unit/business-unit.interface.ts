import type { Document, Model, Types } from "mongoose";
import type { IBusinessUnitBranding, IBusinessUnitContact, IBusinessUnitLocation, IBusinessUnitPerformance, IBusinessUnitPolicy, IBusinessUnitSeo } from "../business-unit-shared/business-unit-shared.interface.ts";


export interface IBusinessUnitCore {
  id: string;
  publicBusinessUnitId: string;
  vendor: Types.ObjectId;
  branding: IBusinessUnitBranding;
  slug: string;
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  tags: string[];
  specialties: string[];
  BusinessUnitType: "general" | "boutique" | "brand" | "marketplace" | "specialty";
  contact: IBusinessUnitContact;
  location: IBusinessUnitLocation;
  multipleLocations?: IBusinessUnitLocation[];

  // ==================== BusinessUnit CONFIGURATION ====================
  settings: {
    currency: "BDT" | "USD";
    language: "en" | "bn";
    timezone: string;
    dateFormat: string;
    weightUnit: "kg" | "g" | "lb";
    dimensionUnit: "cm" | "inch";
    inventoryManagement: boolean;
    lowStockAlert: boolean;
  };

  // ==================== POLICIES & SEO ====================
  policies: IBusinessUnitPolicy;
  seo: IBusinessUnitSeo;

  // ==================== PERFORMANCE & RATINGS ====================
  performance: IBusinessUnitPerformance;
  ratings: {
    average: number;
    count: number;
    totalReviews: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };

  // ==================== STATISTICS ====================
  statistics: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalCustomers: number;
    repeatCustomers: number;
    visitorCount: number;
    conversionRate: number;
    averageOrderValue: number;
  };

  // ==================== STATUS & VISIBILITY ====================
  status: "draft" | "under_review" | "published" | "suspended" | "archived";
  visibility: "public" | "private" | "unlisted";
  isFeatured: boolean;
  isVerified: boolean;
  featuredExpiresAt?: Date;

  // ==================== TIMESTAMPS ====================
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastOrderAt?: Date;
  lastReviewAt?: Date;
}

export type IBusinessUnitCoreDocument = IBusinessUnitCore &
  Document & {
    // Computed Properties
    isActive: boolean;
    isPublished: boolean;
    isSuspended: boolean;
    performanceScore: number;
    totalEarnings: number;
    activePromotionsCount: number;
    lowStockProductsCount: number;
    daysSinceCreation: number;

    // Methods
    updatePerformanceMetrics(): Promise<void>;
    updateStatistics(): Promise<void>;
    publish(): Promise<void>;
    unpublish(): Promise<void>;
    suspend(reason: string): Promise<void>;
    activate(): Promise<void>;
    addProduct(productId: Types.ObjectId): Promise<void>;
    removeProduct(productId: Types.ObjectId): Promise<void>;
    calculateBusinessUnitCommission(): number;
    getProductStats(): Promise<any>;
    getOrderStats(
      timeframe: "daily" | "weekly" | "monthly" | "yearly"
    ): Promise<any>;
  };

export interface IBusinessUnitCoreModel extends Model<IBusinessUnitCoreDocument> {
  // Static Methods
  findFeaturedBusinessUnit(limit?: number): Promise<IBusinessUnitCoreDocument[]>;
  findBusinessUnitByCategory(
    categoryId: Types.ObjectId
  ): Promise<IBusinessUnitCoreDocument[]>;
  findBusinessUnitByVendor(vendorId: Types.ObjectId): Promise<IBusinessUnitCoreDocument[]>;
  searchBusinessUnit(query: string, filters?: any): Promise<IBusinessUnitCoreDocument[]>;
  findTopPerformingBusinessUnit(limit?: number): Promise<IBusinessUnitCoreDocument[]>;
  findNewBusinessUnit(limit?: number): Promise<IBusinessUnitCoreDocument[]>;
  getBusinessUnittats(BusinessUnitId: Types.ObjectId): Promise<any>;

  // Aggregation Methods
  getCategoryBusinessUnittats(categoryId: Types.ObjectId): Promise<any>;
  getVendorBusinessUnittats(vendorId: Types.ObjectId): Promise<any>;
  getPlatformBusinessUnittats(): Promise<any>;
  findBusinessUnitNeedingAttention(): Promise<IBusinessUnitCoreDocument[]>;
  calculateBusinessUnitGrowthMetrics(): Promise<any>;
}
