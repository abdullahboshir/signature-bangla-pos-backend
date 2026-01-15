import { Schema, Types, model } from "mongoose";
import type { IProductDocument, IProductModel } from "./product.interface.ts";
import { BundleProductSchema, DeliveryOptionsSchema, ProductAttributesSchema, ProductStatusSchema, RatingSummarySchema, SEOSchema, TaxConfigurationSchema } from "../../product-shared/product-shared.model.ts";
import { contextScopePlugin } from '@core/plugins/context-scope.plugin.js';



const productSchema = new Schema<IProductDocument, IProductModel>({
  name: { type: String, required: true, trim: true, index: true },
  nameBangla: { type: String, trim: true },
  domain: {
    type: String,
    enum: ["retail", "pharmacy", "grocery", "restaurant", "electronics", "fashion", "service", "construction", "automotive", "health", "hospitality", "other"],
    default: "retail",
    index: true
  },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String, unique: true, sparse: true },
  translations: [{
    lang: { type: String, required: true },
    field: { type: String, required: true },
    value: { type: String, required: true }
  }],
  images: [{ type: String, required: true }],
  videos: [{ type: String, trim: true }],
  unit: { type: Schema.Types.ObjectId, ref: 'Unit' },

  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  outlet: {
    type: Schema.Types.ObjectId,
    ref: "Outlet",
    required: false, // Updated to allow global products
    index: true,
  },
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
  vendor: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isVerified: { type: Boolean, default: false }
  },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  primaryCategory: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

  crossSellProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  upsellProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  brands: [{ type: Schema.Types.ObjectId, ref: 'Brand' }],
  tags: [{ type: String, trim: true }],
  tagsBangla: [{ type: String, trim: true }],

  // References to Sub-documents
  pricing: { type: Schema.Types.ObjectId, ref: 'ProductPricing', required: true },
  inventory: { type: Schema.Types.ObjectId, ref: 'Stock', required: true },
  shipping: { type: Schema.Types.ObjectId, ref: 'ProductShipping', required: true },
  warranty: { type: Schema.Types.ObjectId, ref: 'ProductWarrantyReturn', required: true },
  details: { type: Schema.Types.ObjectId, ref: 'ProductDetails', required: true },

  // Variants System
  hasVariants: { type: Boolean, default: false },
  variantTemplate: { type: Schema.Types.ObjectId, ref: 'ProductVariant' },

  // Bundle Configuration
  isBundle: { type: Boolean, default: false },
  bundleProducts: [BundleProductSchema],
  bundleDiscount: { type: Number, default: 0, min: 0, max: 100 },

  // Ratings & Reviews Summary
  ratings: { type: RatingSummarySchema, default: () => ({}) },

  // Delivery Information
  delivery: { type: DeliveryOptionsSchema, required: true },

  // Product Attributes (Dynamic)
  attributes: { type: ProductAttributesSchema, default: () => ({}) },

  // Origin & Manufacturing
  productmodel: { type: String },
  origine: { type: String },

  // Tax & Compliance
  tax: { type: TaxConfigurationSchema, required: true },
  compliance: {
    hasCertification: { type: Boolean, default: false },
    certifications: [{ type: String }],
    importRestrictions: [{ type: String }],
    safetyStandards: [{ type: String }]
  },

  // Marketing & Promotions
  marketing: {
    isFeatured: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false, index: true },
    isPopular: { type: Boolean, default: false, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    seo: { type: SEOSchema, required: true },
    socialShares: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 }
  },

  // Status & Workflow
  statusInfo: { type: ProductStatusSchema, default: () => ({}) },

  // Module Availability (Omnichannel Control)
  availableModules: {
    type: [{
      type: String,
      enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system']
    }],
    default: ['pos', 'ecommerce'],
    index: true
  },

  isDeleted: { type: Boolean, default: false, select: false },
  deletedAt: { type: Date },

  lastRestockedAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ==================== INDEXES ====================

productSchema.index({ businessUnit: 1 }); // Tenant Isolation (Critical)
productSchema.index({ 'vendor.id': 1, createdAt: -1 });
productSchema.index({ categories: 1, status: 1 });
productSchema.index({ brands: 1, status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'marketing.isFeatured': 1, 'marketing.isTrending': 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// ==================== VIRTUAL PROPERTIES ====================

productSchema.virtual('isNewProduct').get(function (this: IProductDocument) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

productSchema.virtual('isBundleProduct').get(function (this: IProductDocument) {
  return this.isBundle;
});

productSchema.virtual('hasVariantsAvailable').get(function (this: IProductDocument) {
  return this.hasVariants && this.variantTemplate !== undefined;
});

// ==================== INSTANCE METHODS ====================

productSchema.methods['addToWishlist'] = async function (this: IProductDocument): Promise<void> {
  this.marketing.wishlistCount += 1;
  await this.save();
};

// ==================== STATIC METHODS ====================

// Find products by outlet
productSchema.statics['findByOutlet'] = async function (
  outletId: string | Types.ObjectId
): Promise<IProductDocument[]> {
  return this.find({ outlet: outletId, 'statusInfo.isPublished': true });
};

productSchema.statics['searchProducts'] = async function (query: string, filters: any = {}): Promise<IProductDocument[]> {
  const searchFilter: any = {
    $or: [
      { $text: { $search: query } },
      { sku: query },
      { barcode: query } // Exact match for barcode
    ],
    'statusInfo.status': 'published'
  };

  // Apply additional filters
  if (filters.categories) searchFilter.categories = { $in: filters.categories };
  if (filters.brands) searchFilter.brands = { $in: filters.brands };

  return this.find(searchFilter)
    .populate('pricing inventory')
    .sort({ score: { $meta: "textScore" } });
};

productSchema.statics['getSimilarProducts'] = async function (productId: string | Types.ObjectId, limit: number = 10): Promise<IProductDocument[]> {
  const product = await this.findById(productId);
  if (!product) return [];

  return this.find({
    _id: { $ne: productId },
    categories: { $in: product.categories },
    'statusInfo.status': 'published'
  })
    .limit(limit)
    .populate('pricing inventory');
};

// ==================== MIDDLEWARE ====================

productSchema.pre(/^find/, function (this: any, next) {
  // Allow explicit querying for deleted documents if needed (e.g. Trash bin)
  if (this.getQuery().isDeleted === true) {
    return next();
  }
  // Otherwise, filter them out
  this.where({ isDeleted: { $ne: true } });
  next();
});

export const Product = model<IProductDocument, IProductModel>('Product', productSchema);

// Apply Context-Aware Data Isolation
productSchema.plugin(contextScopePlugin, {
  companyField: 'company',
  businessUnitField: 'businessUnit',
  outletField: 'outlet'
});
