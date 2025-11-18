import { Schema, Types, model } from "mongoose";
import type {
  IStoreCoreDocument,
  IStoreCoreModel,
} from "./business-unit.interface.js";

const storeCoreSchema = new Schema<IStoreCoreDocument, IStoreCoreModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    publicStoreId: {
      type: String,
      required: true,
      unique: true, 
      index: true,
      trim: true,
    },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    branding: {
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      descriptionBangla: { type: String },
      logo: { type: String, required: true },
      banner: { type: String },
      favicon: { type: String },
      theme: {
        primaryColor: { type: String, default: "#3B82F6" },
        secondaryColor: { type: String, default: "#1E40AF" },
        accentColor: { type: String, default: "#F59E0B" },
        fontFamily: { type: String, default: "Inter" },
      },
    },
    slug: { type: String, required: true, unique: true, lowercase: true },

    // Categorization
    categories: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    primaryCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    storeType: {
      type: String,
      enum: ["general", "boutique", "brand", "marketplace", "specialty"],
      default: "general",
    },

    // Contact & Location
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      supportHours: { type: String, default: "9 AM - 6 PM" },
      supportPhone: { type: String },
      socialMedia: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        youtube: { type: String },
        linkedin: { type: String },
      },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
      timezone: { type: String, default: "Asia/Dhaka" },
    },
    multipleLocations: [
      {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        postalCode: { type: String },
        coordinates: {
          lat: { type: Number },
          lng: { type: Number },
        },
      },
    ],

    // Store Configuration
    settings: {
      currency: { type: String, enum: ["BDT", "USD"], default: "BDT" },
      language: { type: String, enum: ["en", "bn"], default: "en" },
      timezone: { type: String, default: "Asia/Dhaka" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      weightUnit: { type: String, enum: ["kg", "g", "lb"], default: "kg" },
      dimensionUnit: { type: String, enum: ["cm", "inch"], default: "cm" },
      inventoryManagement: { type: Boolean, default: true },
      lowStockAlert: { type: Boolean, default: true },
    },

    // Policies & SEO
    policies: {
      returnPolicy: { type: String, required: true },
      shippingPolicy: { type: String, required: true },
      privacyPolicy: { type: String, required: true },
      termsOfService: { type: String, required: true },
      warrantyPolicy: { type: String },
      refundPolicy: { type: String },
    },
    seo: {
      metaTitle: { type: String, required: true },
      metaDescription: { type: String, required: true },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
      ogImage: { type: String },
      structuredData: { type: Schema.Types.Mixed },
    },

    // Performance & Ratings
    performance: {
      responseRate: { type: Number, default: 0, min: 0, max: 100 },
      fulfillmentRate: { type: Number, default: 0, min: 0, max: 100 },
      onTimeDeliveryRate: { type: Number, default: 0, min: 0, max: 100 },
      customerSatisfaction: { type: Number, default: 0, min: 0, max: 5 },
      productQualityScore: { type: Number, default: 0, min: 0, max: 5 },
      overallScore: { type: Number, default: 0, min: 0, max: 100 },
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      distribution: {
        1: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        5: { type: Number, default: 0 },
      },
    },

    // Statistics
    statistics: {
      totalProducts: { type: Number, default: 0 },
      activeProducts: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 },
      totalCustomers: { type: Number, default: 0 },
      repeatCustomers: { type: Number, default: 0 },
      visitorCount: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0, min: 0, max: 100 },
      averageOrderValue: { type: Number, default: 0 },
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ["draft", "under_review", "published", "suspended", "archived"],
      default: "draft",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    featuredExpiresAt: { type: Date },

    // Timestamps
    publishedAt: { type: Date },
    lastOrderAt: { type: Date },
    lastReviewAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
storeCoreSchema.index({ vendor: 1 });
storeCoreSchema.index({ slug: 1 });
storeCoreSchema.index({ status: 1, visibility: 1 });
storeCoreSchema.index({ categories: 1 });
storeCoreSchema.index({ primaryCategory: 1 });
storeCoreSchema.index({ isFeatured: 1 });
storeCoreSchema.index({
  "branding.name": "text",
  "branding.description": "text",
  tags: "text",
});
storeCoreSchema.index({ createdAt: -1 });
storeCoreSchema.index({ "ratings.average": -1 });
storeCoreSchema.index({ "statistics.totalRevenue": -1 });

// ==================== VIRTUAL PROPERTIES ====================
storeCoreSchema.virtual("isActive").get(function () {
  return this.status === "published" && this.visibility === "public";
});

storeCoreSchema.virtual("isPublished").get(function () {
  return this.status === "published";
});

storeCoreSchema.virtual("isSuspended").get(function () {
  return this.status === "suspended";
});

storeCoreSchema.virtual("performanceScore").get(function () {
  return this.performance.overallScore;
});

storeCoreSchema.virtual("totalEarnings").get(function () {
  return this.statistics.totalRevenue;
});

storeCoreSchema.virtual("daysSinceCreation").get(function () {
  const diffTime = Math.abs(new Date().getTime() - this.createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// ==================== INSTANCE METHODS ====================
storeCoreSchema.methods.updatePerformanceMetrics =
  async function (): Promise<void> {
    // This would typically calculate performance based on actual data
    const overallScore =
      (this.performance.responseRate +
        this.performance.fulfillmentRate +
        this.performance.onTimeDeliveryRate +
        this.performance.customerSatisfaction * 20 +
        this.performance.productQualityScore * 20) /
      5;

    this.performance.overallScore = Math.round(overallScore);
    await this.save();
  };

storeCoreSchema.methods.updateStatistics = async function (): Promise<void> {
  // This would update statistics from actual order and product data
  // For now, we'll keep it simple
  await this.save();
};

storeCoreSchema.methods.publish = async function (): Promise<void> {
  this.status = "published";
  this.publishedAt = new Date();
  await this.save();
};

storeCoreSchema.methods.unpublish = async function (): Promise<void> {
  this.status = "draft";
  await this.save();
};

storeCoreSchema.methods.suspend = async function (
  reason: string
): Promise<void> {
  this.status = "suspended";
  await this.save();
};

storeCoreSchema.methods.activate = async function (): Promise<void> {
  this.status = "published";
  await this.save();
};

storeCoreSchema.methods.addProduct = async function (
  productId: Types.ObjectId
): Promise<void> {
  // This would typically increment product count
  this.statistics.totalProducts += 1;
  this.statistics.activeProducts += 1;
  await this.save();
};

storeCoreSchema.methods.removeProduct = async function (
  productId: Types.ObjectId
): Promise<void> {
  this.statistics.totalProducts = Math.max(
    0,
    this.statistics.totalProducts - 1
  );
  this.statistics.activeProducts = Math.max(
    0,
    this.statistics.activeProducts - 1
  );
  await this.save();
};

storeCoreSchema.methods.calculateStoreCommission = function (): number {
  // Default commission calculation - would vary by platform
  return this.statistics.totalRevenue * 0.1; // 10% commission
};

storeCoreSchema.methods.getProductStats = async function (): Promise<any> {
  // This would aggregate product statistics
  return {
    total: this.statistics.totalProducts,
    active: this.statistics.activeProducts,
    categories: this.categories.length,
  };
};

storeCoreSchema.methods.getOrderStats = async function (
  timeframe: "daily" | "weekly" | "monthly" | "yearly"
): Promise<any> {
  // This would aggregate order statistics based on timeframe
  return {
    timeframe,
    orders: this.statistics.totalOrders,
    revenue: this.statistics.totalRevenue,
    averageOrderValue: this.statistics.averageOrderValue,
  };
};

// ==================== STATIC METHODS ====================
storeCoreSchema.statics.findFeaturedStores = function (
  limit: number = 12
): Promise<IStoreCoreDocument[]> {
  return this.find({
    isFeatured: true,
    status: "published",
    visibility: "public",
    $or: [
      { featuredExpiresAt: { $exists: false } },
      { featuredExpiresAt: { $gte: new Date() } },
    ],
  })
    .populate("vendor", "businessInfo.legalName businessInfo.tradeName")
    .populate("primaryCategory", "name slug")
    .limit(limit)
    .sort({ "ratings.average": -1, "statistics.totalRevenue": -1 });
};

storeCoreSchema.statics.findStoresByCategory = function (
  categoryId: Types.ObjectId
): Promise<IStoreCoreDocument[]> {
  return this.find({
    categories: categoryId,
    status: "published",
    visibility: "public",
  })
    .populate("vendor", "businessInfo.legalName")
    .populate("primaryCategory", "name slug")
    .sort({ "ratings.average": -1, "statistics.totalRevenue": -1 });
};

storeCoreSchema.statics.findStoresByVendor = function (
  vendorId: Types.ObjectId
): Promise<IStoreCoreDocument[]> {
  return this.find({ vendor: vendorId })
    .populate("primaryCategory", "name slug")
    .sort({ createdAt: -1 });
};

storeCoreSchema.statics.searchStores = function (
  query: string,
  filters: any = {}
): Promise<IStoreCoreDocument[]> {
  const searchFilter: any = {
    $text: { $search: query },
    status: "published",
    visibility: "public",
  };

  if (filters.categories) searchFilter.categories = { $in: filters.categories };
  if (filters.storeType) searchFilter.storeType = filters.storeType;
  if (filters.minRating)
    searchFilter["ratings.average"] = { $gte: filters.minRating };

  return this.find(searchFilter)
    .populate("vendor", "businessInfo.legalName businessInfo.tradeName")
    .populate("primaryCategory", "name slug")
    .sort({ score: { $meta: "textScore" }, "ratings.average": -1 })
    .limit(filters.limit || 20);
};

storeCoreSchema.statics.findTopPerformingStores = function (
  limit: number = 10
): Promise<IStoreCoreDocument[]> {
  return this.find({
    status: "published",
    visibility: "public",
    "statistics.totalOrders": { $gt: 0 },
  })
    .populate("vendor", "businessInfo.legalName")
    .populate("primaryCategory", "name slug")
    .limit(limit)
    .sort({ "performance.overallScore": -1, "statistics.totalRevenue": -1 });
};

storeCoreSchema.statics.findNewStores = function (
  limit: number = 10
): Promise<IStoreCoreDocument[]> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.find({
    status: "published",
    visibility: "public",
    createdAt: { $gte: thirtyDaysAgo },
  })
    .populate("vendor", "businessInfo.legalName")
    .populate("primaryCategory", "name slug")
    .limit(limit)
    .sort({ createdAt: -1 });
};

storeCoreSchema.statics.getStoreStats = async function (
  storeId: Types.ObjectId
): Promise<any> {
  return this.aggregate([
    { $match: { _id: storeId } },
    {
      $project: {
        storeName: "$branding.name",
        vendor: 1,
        status: 1,
        totalProducts: "$statistics.totalProducts",
        activeProducts: "$statistics.activeProducts",
        totalOrders: "$statistics.totalOrders",
        totalRevenue: "$statistics.totalRevenue",
        averageRating: "$ratings.average",
        performanceScore: "$performance.overallScore",
        daysActive: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60 * 24,
          ],
        },
      },
    },
  ]);
};

storeCoreSchema.statics.getCategoryStoreStats = async function (
  categoryId: Types.ObjectId
): Promise<any> {
  return this.aggregate([
    { $match: { categories: categoryId, status: "published" } },
    {
      $group: {
        _id: "$primaryCategory",
        totalStores: { $sum: 1 },
        averageRating: { $avg: "$ratings.average" },
        totalProducts: { $sum: "$statistics.totalProducts" },
        totalRevenue: { $sum: "$statistics.totalRevenue" },
      },
    },
  ]);
};

storeCoreSchema.statics.getVendorStoreStats = async function (
  vendorId: Types.ObjectId
): Promise<any> {
  return this.aggregate([
    { $match: { vendor: vendorId } },
    {
      $group: {
        _id: "$status",
        storeCount: { $sum: 1 },
        totalProducts: { $sum: "$statistics.totalProducts" },
        totalRevenue: { $sum: "$statistics.totalRevenue" },
        averageRating: { $avg: "$ratings.average" },
      },
    },
  ]);
};

storeCoreSchema.statics.getPlatformStoreStats =
  async function (): Promise<any> {
    return this.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: null,
          totalStores: { $sum: 1 },
          featuredStores: { $sum: { $cond: ["$isFeatured", 1, 0] } },
          verifiedStores: { $sum: { $cond: ["$isVerified", 1, 0] } },
          averageRating: { $avg: "$ratings.average" },
          totalProducts: { $sum: "$statistics.totalProducts" },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
        },
      },
    ]);
  };

storeCoreSchema.statics.findStoresNeedingAttention = function (): Promise<
  IStoreCoreDocument[]
> {
  return this.find({
    status: "published",
    $or: [
      { "performance.overallScore": { $lt: 60 } },
      { "ratings.average": { $lt: 3.0 } },
      { "statistics.activeProducts": 0 },
      {
        "statistics.totalOrders": 0,
        createdAt: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    ],
  })
    .populate("vendor", "businessInfo.legalName contact.email")
    .limit(50);
};

storeCoreSchema.statics.calculateStoreGrowthMetrics =
  async function (): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.aggregate([
      {
        $match: {
          status: "published",
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          newStores: { $sum: 1 },
          totalRevenue: { $sum: "$statistics.totalRevenue" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  };

export const StoreCore = model<IStoreCoreDocument, IStoreCoreModel>(
  "Store",
  storeCoreSchema
);
