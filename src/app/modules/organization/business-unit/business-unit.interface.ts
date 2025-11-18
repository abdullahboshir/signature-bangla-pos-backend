import type { Document, Model, Types } from "mongoose";
import type {
  IStoreBranding,
  IStoreContact,
  IStoreLocation,
  IStoreSeo,
  IStorePolicy,
  IStorePerformance,
} from "../store-shared/store.shared.interface.js";

export interface IStoreCore {
  id: string;
  publicStoreId: string;
  vendor: Types.ObjectId;
  branding: IStoreBranding;
  slug: string;
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  tags: string[];
  specialties: string[];
  storeType: "general" | "boutique" | "brand" | "marketplace" | "specialty";
  contact: IStoreContact;
  location: IStoreLocation;
  multipleLocations?: IStoreLocation[];

  // ==================== STORE CONFIGURATION ====================
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
  policies: IStorePolicy;
  seo: IStoreSeo;

  // ==================== PERFORMANCE & RATINGS ====================
  performance: IStorePerformance;
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

export type IStoreCoreDocument = IStoreCore &
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
    calculateStoreCommission(): number;
    getProductStats(): Promise<any>;
    getOrderStats(
      timeframe: "daily" | "weekly" | "monthly" | "yearly"
    ): Promise<any>;
  };

export interface IStoreCoreModel extends Model<IStoreCoreDocument> {
  // Static Methods
  findFeaturedStores(limit?: number): Promise<IStoreCoreDocument[]>;
  findStoresByCategory(
    categoryId: Types.ObjectId
  ): Promise<IStoreCoreDocument[]>;
  findStoresByVendor(vendorId: Types.ObjectId): Promise<IStoreCoreDocument[]>;
  searchStores(query: string, filters?: any): Promise<IStoreCoreDocument[]>;
  findTopPerformingStores(limit?: number): Promise<IStoreCoreDocument[]>;
  findNewStores(limit?: number): Promise<IStoreCoreDocument[]>;
  getStoreStats(storeId: Types.ObjectId): Promise<any>;

  // Aggregation Methods
  getCategoryStoreStats(categoryId: Types.ObjectId): Promise<any>;
  getVendorStoreStats(vendorId: Types.ObjectId): Promise<any>;
  getPlatformStoreStats(): Promise<any>;
  findStoresNeedingAttention(): Promise<IStoreCoreDocument[]>;
  calculateStoreGrowthMetrics(): Promise<any>;
}
