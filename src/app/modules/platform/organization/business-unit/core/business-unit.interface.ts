import type { Document, Model, Types } from 'mongoose';
import type { ISharedBranding, ISharedContact, ISharedLocation } from '../../shared/common.interface.js';
import type {
  IBusinessUnitPerformance,
  IBusinessUnitPolicy,
  IBusinessUnitSeo,
} from "../shared/common.interface.js";

export interface IBusinessUnitCore {
  name: string;
  id: string;
  company?: Types.ObjectId;

  // ====== SHARED STRUCTURES ======
  branding: ISharedBranding;
  contact: ISharedContact;
  location: ISharedLocation;

  slug: string;

  // ====== CATEGORIZATION ======
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  tags: string[];
  specialties: string[];
  attributeGroup?: Types.ObjectId; // Deprecated: Use attributeGroups instead
  attributeGroups?: Types.ObjectId[];
  operationalModel:
  | "retail"
  | "wholesale"
  | "distributor"
  | "manufacturing"
  | "service"
  | "online_only"
  | "hybrid"
  | "marketplace";

  industry:
  | "fashion"
  | "electronics"
  | "grocery"
  | "pharmacy"
  | "restaurant"
  | "beauty"
  | "furniture"
  | "automotive"
  | "books_stationery"
  | "general"
  | "other";

  // ====== LOCALIZATION (Identity Defaults) ======
  localization: {
    currency: "BDT" | "USD";
    language: "en" | "bn";
    timezone: string;
    dateFormat: string;
    inventoryManagement: boolean;
    lowStockAlert: boolean;
  };

  // ====== POLICIES & SEO & FEATURES ======


  policies?: IBusinessUnitPolicy;
  seo: IBusinessUnitSeo;
  features: {
    hasInventory: boolean;
    hasVariants: boolean;
    hasAttributeGroups: boolean;
    hasShipping: boolean;
    hasSeo: boolean;
    hasCompliance: boolean;
    hasBundles: boolean;
    hasWarranty: boolean;
  };

  // ====== ACTIVE MODULES (LICENSE GUARD) ======
  /**
   * Module activation flags with optional granular feature control
   * @example
   * activeModules: {
   *   pos: true,  // Simple boolean (backward compatible)
   *   commerce: { // Or granular object
   *     enabled: true,
   *     features: { reviews: true, wishlist: false }
   *   }
   * }
   */
  activeModules: {
    pos: boolean | { enabled: boolean; features?: Record<string, boolean> };
    erp: boolean | { enabled: boolean; features?: Record<string, boolean> };
    hrm: boolean | { enabled: boolean; features?: Record<string, boolean> };
    ecommerce: boolean | { enabled: boolean; features?: Record<string, boolean> };
    crm: boolean | { enabled: boolean; features?: Record<string, boolean> };
    logistics: boolean | { enabled: boolean; features?: Record<string, boolean> };
    governance: boolean | { enabled: boolean; features?: Record<string, boolean> };
    integrations: boolean | { enabled: boolean; features?: Record<string, boolean> };
    saas: boolean | { enabled: boolean; features?: Record<string, boolean> };
  };

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

  isDeleted?: boolean;
  deletedAt?: Date;

  // Virtuals
  settings?: any; // To be typed as IBusinessUnitSettings in a higher-level combined type
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