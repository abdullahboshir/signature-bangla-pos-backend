import { Schema, Types, model } from "mongoose";
import type { IProductDocument, IProductModel } from "./product-core.interface.js";
import { BundleProductSchema, DeliveryOptionsSchema, ProductAttributesSchema, ProductStatusSchema, RatingSummarySchema, SEOSchema, TaxConfigurationSchema } from "../../product-shared/product-shared.model.js";



const productSchema = new Schema<IProductDocument, IProductModel>({
  name: { type: String, required: true, trim: true, index: true },
  nameBangla: { type: String, trim: true },
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

  outlet: {
    type: Schema.Types.ObjectId,
    ref: "Outlet",
    required: false, // Updated to allow global products
    index: true,
  },
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
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
  inventory: { type: Schema.Types.ObjectId, ref: 'ProductInventory', required: true },
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

productSchema.virtual('discountedPrice').get(function (this: IProductDocument) {
  // This will be populated from pricing subdocument
  return 0;
});

productSchema.virtual('finalPrice').get(function (this: IProductDocument) {
  // This will be populated from pricing subdocument
  return 0;
});

productSchema.virtual('isOnSale').get(function (this: IProductDocument) {
  // This will be populated from pricing subdocument
  return false;
});

productSchema.virtual('isNewProduct').get(function (this: IProductDocument) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.createdAt > thirtyDaysAgo;
});

productSchema.virtual('isLowStock').get(function (this: IProductDocument) {
  // This will be populated from inventory subdocument
  return false;
});

productSchema.virtual('isOutOfStock').get(function (this: IProductDocument) {
  // This will be populated from inventory subdocument
  return false;
});

productSchema.virtual('isFlashSaleActive').get(function (this: IProductDocument) {
  // This will be populated from pricing subdocument
  return false;
});

productSchema.virtual('isBundleProduct').get(function (this: IProductDocument) {
  return this.isBundle;
});

productSchema.virtual('hasVariantsAvailable').get(function (this: IProductDocument) {
  return this.hasVariants && this.variantTemplate !== undefined;
});

productSchema.virtual('stockPercentage').get(function (this: IProductDocument) {
  // This will be populated from inventory subdocument
  return 0;
});

productSchema.virtual('estimatedProfit').get(function (this: IProductDocument) {
  // This will be calculated from pricing and inventory
  return 0;
});

// ==================== INSTANCE METHODS ====================

productSchema.methods['isInStock'] = function (this: IProductDocument): boolean {
  // Implementation will depend on inventory data
  return true;
};

productSchema.methods['getMaxPurchaseQuantity'] = function (this: IProductDocument): number {
  // Implementation will depend on inventory data
  return 10;
};

productSchema.methods['canOrderQuantity'] = function (this: IProductDocument, quantity: number): boolean {
  return quantity > 0 && quantity <= this.getMaxPurchaseQuantity();
};

productSchema.methods['updateStock'] = async function (this: IProductDocument, _quantity: number, _operation: "add" | "subtract"): Promise<void> {
  // Implementation will update inventory subdocument
};

productSchema.methods['reserveStock'] = async function (this: IProductDocument, _quantity: number): Promise<boolean> {
  // Implementation will reserve stock in inventory
  return true;
};

productSchema.methods['releaseStock'] = async function (this: IProductDocument, _quantity: number): Promise<void> {
  // Implementation will release reserved stock
};

productSchema.methods['calculateCommission'] = function (this: IProductDocument): number {
  // Implementation will calculate commission from pricing
  return 0;
};

productSchema.methods['calculateTax'] = function (this: IProductDocument, _quantity: number): number {
  // Implementation will calculate tax
  return 0;
};

productSchema.methods['getShippingCost'] = function (this: IProductDocument, _destination: string, _method: string): number {
  // Implementation will calculate shipping cost
  return 0;
};

productSchema.methods['addToWishlist'] = async function (this: IProductDocument): Promise<void> {
  this.marketing.wishlistCount += 1;
  await this.save();
};

productSchema.methods['incrementViewCount'] = async function (this: IProductDocument): Promise<void> {
  // This would typically update analytics
};

productSchema.methods['updateRatingStats'] = async function (this: IProductDocument): Promise<void> {
  // This would recalculate rating statistics from reviews
};

// ==================== STATIC METHODS ====================

productSchema.statics['findFeatured'] = async function (): Promise<IProductDocument[]> {
  return this.find({
    'marketing.isFeatured': true,
    'statusInfo.status': 'published'
  }).populate('pricing inventory').limit(20);
};

productSchema.statics['findByCategory'] = async function (categoryId: string | Types.ObjectId): Promise<IProductDocument[]> {
  return this.find({
    categories: categoryId,
    'statusInfo.status': 'published'
  }).populate('pricing inventory');
};

// Find products by outlet
productSchema.statics['findByOutlet'] = async function (
  outletId: string | Types.ObjectId
): Promise<IProductDocument[]> {
  return this.find({ outlet: outletId, 'statusInfo.isPublished': true });
};

productSchema.statics['findTrending'] = async function (limit: number = 20): Promise<IProductDocument[]> {
  return this.find({
    'marketing.isTrending': true,
    'statusInfo.status': 'published'
  })
    .sort({ 'marketing.socialShares': -1, 'ratings.average': -1 })
    .limit(limit)
    .populate('pricing inventory');
};

productSchema.statics['findFlashSales'] = async function (): Promise<IProductDocument[]> {
  return this.find({
    'statusInfo.status': 'published'
  })
    .populate({
      path: 'pricing',
      match: {
        'flashSale.isActive': true,
        'flashSale.startDate': { $lte: new Date() },
        'flashSale.endDate': { $gte: new Date() }
      }
    })
    .then(products => products.filter(product => product.pricing));
};

productSchema.statics['findLowStock'] = async function (): Promise<IProductDocument[]> {
  return this.find({
    'statusInfo.status': 'published'
  })
    .populate({
      path: 'inventory',
      match: {
        'inventory.stockStatus': 'limited_stock',
        'inventory.stock': { $lte: 10 }
      }
    })
    .then(products => products.filter(product => product.inventory));
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
  if (filters.minPrice || filters.maxPrice) {
    // This would require pricing population and filtering
  }

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

productSchema.statics['updateBulkPrices'] = async function (products: string[], updateData: any): Promise<void> {
  // Implementation for bulk price updates
  await this.updateMany(
    { _id: { $in: products } },
    { $set: updateData }
  );
};

productSchema.statics['getProductAnalytics'] = async function (_productId: string | Types.ObjectId): Promise<any> {
  // Implementation for product analytics aggregation
  return {};
};

productSchema.statics['getCategoryStats'] = async function (categoryId: string | Types.ObjectId): Promise<any> {
  return this.aggregate([
    { $match: { categories: categoryId, 'statusInfo.status': 'published' } },
    {
      $group: {
        _id: '$statusInfo.status',
        totalProducts: { $sum: 1 },
        averageRating: { $avg: '$ratings.average' },
        totalReviews: { $sum: '$ratings.totalReviews' }
      }
    }
  ]);
};

productSchema.statics['getBrandStats'] = async function (brandId: string | Types.ObjectId): Promise<any> {
  return this.aggregate([
    { $match: { brands: brandId, 'statusInfo.status': 'published' } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averageRating: { $avg: '$ratings.average' },
        featuredProducts: { $sum: { $cond: ['$marketing.isFeatured', 1, 0] } }
      }
    }
  ]);
};

productSchema.statics['getVendorStats'] = async function (vendorId: string | Types.ObjectId): Promise<any> {
  return this.aggregate([
    { $match: { 'vendor.id': vendorId } },
    {
      $group: {
        _id: '$statusInfo.status',
        totalProducts: { $sum: 1 },
        publishedProducts: { $sum: { $cond: [{ $eq: ['$statusInfo.status', 'published'] }, 1, 0] } },
        averageRating: { $avg: '$ratings.average' }
      }
    }
  ]);
};

productSchema.statics['getSalesReport'] = async function (startDate: Date, endDate: Date): Promise<any> {
  // This would typically join with orders collection
  return this.aggregate([
    {
      $match: {
        'statusInfo.status': 'published',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        newProducts: { $sum: { $cond: [{ $gt: ['$createdAt', startDate] }, 1, 0] } }
      }
    }
  ]);
};

export const Product = model<IProductDocument, IProductModel>('Product', productSchema);