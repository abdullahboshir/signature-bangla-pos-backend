
import { model, Schema } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";
import type { IBusinessUnitCoreDocument, IBusinessUnitCoreModel } from "./business-unit.interface.js";
import { brandingSchema, contactSchema, locationSchema } from "../../shared/common.schema.js";

export const businessUnitCoreSchema = new Schema<
  IBusinessUnitCoreDocument,
  IBusinessUnitCoreModel
>(
  {
    branding: { type: brandingSchema, required: true },
    contact: { type: contactSchema, required: true },
    location: { type: locationSchema, required: true },

    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      index: true,
      unique: true,
    },
    domain: {
      type: String,
      enum: ["retail", "pharmacy", "grocery", "restaurant", "electronics", "fashion", "service", "construction", "automotive", "health", "hospitality", "other"],
      default: "retail",
      index: true
    },
    attributeGroup: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    attributeGroups: [{ type: Schema.Types.ObjectId, ref: 'Category', index: true }],

    // ====== LOCALIZATION (Identity Defaults) ======
    localization: {
      currency: { type: String, enum: ["BDT", "USD"], default: "BDT" },
      language: { type: String, enum: ["en", "bn"], default: "en" },
      timezone: { type: String, default: "Asia/Dhaka" },
      dateFormat: { type: String, default: "DD/MM/YYYY" },
      weightUnit: { type: String, enum: ["kg", "g", "lb"], default: "kg" },
      dimensionUnit: { type: String, enum: ["cm", "inch"], default: "cm" },
      inventoryManagement: { type: Boolean, default: true },
      lowStockAlert: { type: Boolean, default: true },
    },



    features: {
      hasInventory: { type: Boolean, default: true },
      hasVariants: { type: Boolean, default: true },
      hasAttributeGroups: { type: Boolean, default: true },
      hasShipping: { type: Boolean, default: true },
      hasSeo: { type: Boolean, default: true },
      hasCompliance: { type: Boolean, default: true },
      hasBundles: { type: Boolean, default: true },
      hasWarranty: { type: Boolean, default: true }
    },

    // ====== ACTIVE MODULES ======
    activeModules: {
      pos: { type: Schema.Types.Mixed, default: true },
      erp: { type: Schema.Types.Mixed, default: true },
      hrm: { type: Schema.Types.Mixed, default: false },
      ecommerce: { type: Schema.Types.Mixed, default: false },
      crm: { type: Schema.Types.Mixed, default: false },
      logistics: { type: Schema.Types.Mixed, default: false },
      governance: { type: Schema.Types.Mixed, default: false },
      integrations: { type: Schema.Types.Mixed, default: false },
      saas: { type: Schema.Types.Mixed, default: false }
    },

    // ====== POLICIES & SEO ======
    policies: {
      returnPolicy: { type: String, required: false },
      shippingPolicy: { type: String, required: false },
      privacyPolicy: { type: String, required: false },
      termsOfService: { type: String, required: false },
      warrantyPolicy: { type: String },
      refundPolicy: { type: String }
    },
    seo: {
      metaTitle: { type: String, required: false, default: "" },
      metaDescription: { type: String, required: false, default: "" },
      keywords: [{ type: String }],
      canonicalUrl: { type: String },
      ogImage: { type: String },
      structuredData: { type: Schema.Types.Mixed },
    },

    // ====== PERFORMANCE & RATINGS ======
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

    // ====== STATISTICS ======
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

    // ====== STATUS & VISIBILITY ======
    status: {
      type: String,
      enum: ["draft", "under_review", "published", "suspended", "archived"],
      default: "draft",
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isVerified: { type: Boolean, default: false },
    featuredExpiresAt: { type: Date },

    // ====== TIMESTAMPS ======
    publishedAt: { type: Date },
    lastOrderAt: { type: Date },
    lastReviewAt: { type: Date },

    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
businessUnitCoreSchema.index({ vendor: 1 });
businessUnitCoreSchema.index({ slug: 1 });
businessUnitCoreSchema.index({ status: 1, visibility: 1 });
businessUnitCoreSchema.index({ categories: 1 });
businessUnitCoreSchema.index({ primaryCategory: 1 });
businessUnitCoreSchema.index({ isFeatured: 1 });
businessUnitCoreSchema.index({
  "branding.name": "text",
  "branding.description": "text",
  tags: "text",
});
businessUnitCoreSchema.index({ createdAt: -1 });
businessUnitCoreSchema.index({ "ratings.average": -1 });
businessUnitCoreSchema.index({ "statistics.totalRevenue": -1 });

// ==================== VIRTUAL PROPERTIES ====================
businessUnitCoreSchema.virtual("isActive").get(function (this: IBusinessUnitCoreDocument) {
  return this.status === "published" && this.visibility === "public";
});

businessUnitCoreSchema.virtual("isPublished").get(function (this: IBusinessUnitCoreDocument) {
  return this.status === "published";
});

businessUnitCoreSchema.virtual("isSuspended").get(function (this: IBusinessUnitCoreDocument) {
  return this.status === "suspended";
});

businessUnitCoreSchema.virtual("performanceScore").get(function (this: IBusinessUnitCoreDocument) {
  return this.performance?.overallScore || 0;
});

businessUnitCoreSchema.virtual("totalEarnings").get(function (this: IBusinessUnitCoreDocument) {
  return this.statistics?.totalRevenue || 0;
});

businessUnitCoreSchema.virtual("daysSinceCreation").get(function (this: IBusinessUnitCoreDocument) {
  if (!this.createdAt) return 0;
  const diffTime = Math.abs(
    new Date().getTime() - this.createdAt.getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

businessUnitCoreSchema.virtual("outlets", {
  ref: "Outlet",
  localField: "_id",
  foreignField: "businessUnit"
});

// Virtual for business unit settings
businessUnitCoreSchema.virtual('settings', {
  ref: 'BusinessUnitSettings',
  localField: '_id',
  foreignField: 'businessUnit',
  justOne: true
});


const BusinessUnit = model<IBusinessUnitCoreDocument, IBusinessUnitCoreModel>(
  "BusinessUnit",
  businessUnitCoreSchema
);

// Apply Context-Aware Data Isolation
businessUnitCoreSchema.plugin(contextScopePlugin, {
  companyField: 'company'
});

export default BusinessUnit