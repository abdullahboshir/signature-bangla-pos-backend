// ============================================================================
// FILE 1: src/app/modules/organization/business-unit/types/business-unit.interface.ts
// ============================================================================

import type { Document, Model, Types } from "mongoose";
import type {
  IBusinessUnitBranding,
  IBusinessUnitContact,
  IBusinessUnitLocation,
  IBusinessUnitPerformance,
  IBusinessUnitPolicy,
  IBusinessUnitSeo,
} from "../business-unit-shared/business-unit-shared.interface.js";

export interface IBusinessUnitCore {
  name: string;
  id: string; 

  // ====== BRANDING ======
  branding: IBusinessUnitBranding;
  slug: string;

  // ====== CATEGORIZATION ======
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  tags: string[];
  specialties: string[];
  businessUnitType: "general" | "boutique" | "brand" | "marketplace" | "specialty";

  // ====== CONTACT & LOCATION ======
  contact: IBusinessUnitContact;
  location: IBusinessUnitLocation;
  multipleLocations?: IBusinessUnitLocation[];

  // ====== SETTINGS ======
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

  // ====== POLICIES & SEO ======
  policies?: IBusinessUnitPolicy;
  seo: IBusinessUnitSeo;

  // ====== PERFORMANCE & RATINGS ======
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

  // ====== STATISTICS ======
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

  // ====== STATUS & VISIBILITY ======
  status: "draft" | "under_review" | "published" | "suspended" | "archived";
  visibility: "public" | "private" | "unlisted";
  isFeatured: boolean;
  isVerified: boolean;
  featuredExpiresAt?: Date;

  // ====== TIMESTAMPS ======
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  lastOrderAt?: Date;
  lastReviewAt?: Date;
}

// ==================== DOCUMENT INTERFACE ====================
export interface IBusinessUnitCoreDocument extends Document, IBusinessUnitCore {

id: string;
  isActive: boolean; // status === "published" && visibility === "public"
  isPublished: boolean; // status === "published"
  isSuspended: boolean; // status === "suspended"
  performanceScore: number; // performance.overallScore
  totalEarnings: number; // statistics.totalRevenue
  daysSinceCreation: number; // calculated from createdAt

  // ====== INSTANCE METHODS - STATUS MANAGEMENT ======
  publish(): Promise<void>;
  unpublish(): Promise<void>;
  suspend(reason: string): Promise<void>;
  activate(): Promise<void>;

  // ====== INSTANCE METHODS - METRICS ======
  updatePerformanceMetrics(): Promise<void>;
  updateStatistics(): Promise<void>;

  // ====== INSTANCE METHODS - PRODUCT MANAGEMENT ======
  addProduct(productId: Types.ObjectId): Promise<void>;
  removeProduct(productId: Types.ObjectId): Promise<void>;

  // ====== INSTANCE METHODS - STATISTICS & CALCULATIONS ======
  calculateBusinessUnitCommission(): number;
  getProductStats(): Promise<{
    total: number;
    active: number;
    categories: number;
  }>;
  getOrderStats(
    timeframe: "daily" | "weekly" | "monthly" | "yearly"
  ): Promise<{
    timeframe: string;
    orders: number;
    revenue: number;
    averageOrderValue: number;
  }>;
}

// ==================== MODEL INTERFACE ====================
export interface IBusinessUnitCoreModel
  extends Model<IBusinessUnitCoreDocument> {
  // ====== SEARCH & FILTER ======
  findFeaturedBusinessUnits(
    limit?: number
  ): Promise<IBusinessUnitCoreDocument[]>;

  findBusinessUnitsByCategory(
    categoryId: Types.ObjectId
  ): Promise<IBusinessUnitCoreDocument[]>;

  findBusinessUnitsByVendor(
    vendorId: Types.ObjectId
  ): Promise<IBusinessUnitCoreDocument[]>;

  searchBusinessUnits(
    query: string,
    filters?: any
  ): Promise<IBusinessUnitCoreDocument[]>;

  findTopPerformingBusinessUnits(
    limit?: number
  ): Promise<IBusinessUnitCoreDocument[]>;

  findNewBusinessUnits(
    limit?: number
  ): Promise<IBusinessUnitCoreDocument[]>;

  findBusinessUnitsNeedingAttention(): Promise<IBusinessUnitCoreDocument[]>;

  // ====== ANALYTICS & STATISTICS ======
  getBusinessUnitStats(
    id: Types.ObjectId
  ): Promise<any>;

  getCategoryBusinessUnitStats(
    categoryId: Types.ObjectId
  ): Promise<any>;

  getVendorBusinessUnitStats(
    vendorId: Types.ObjectId
  ): Promise<any>;

  getPlatformBusinessUnitStats(): Promise<any>;

  calculateBusinessUnitGrowthMetrics(): Promise<any>;
}

// ==================== EXPORT TYPES ====================
export type BusinessUnitCoreInput = Partial<IBusinessUnitCore>;
export type BusinessUnitCoreUpdate = Partial<IBusinessUnitCore>;
export type BusinessUnitCoreResponse = IBusinessUnitCoreDocument;