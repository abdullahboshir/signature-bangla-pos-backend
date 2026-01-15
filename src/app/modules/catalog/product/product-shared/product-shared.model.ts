import { Schema } from "mongoose";

export const SEOSchema = new Schema({
  slug: { type: String, required: true },
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  keywords: [{ type: String }],
  canonicalUrl: { type: String },
  ogImage: { type: String }
}, { _id: false });

export const TaxConfigurationSchema = new Schema({
  taxable: { type: Boolean, default: false },
  taxClass: { type: String, required: true },
  taxRate: { type: Number, default: 0 },
  taxInclusive: { type: Boolean, default: false },
  hscode: { type: String }
}, { _id: false });

export const BundleProductSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  discount: { type: Number, min: 0, max: 100 }
}, { _id: false });

export const ProductStatusSchema = new Schema({
  status: {
    type: String,
    enum: ["draft", "under_review", "published", "rejected", "archived", "suspended"],
    default: "draft"
  },
  rejectionReason: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  publishedAt: { type: Date }
}, { _id: false });

export const PhysicalPropertiesSchema = new Schema({
  weight: { type: Number },
  weightUnit: { type: String, enum: ["kg", "g", "lb"] },
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: ["cm", "inch"] }
  }
}, { _id: false });

export const ProductAttributesSchema = new Schema({
  isOrganic: { type: Boolean, default: false },
  isElectric: { type: Boolean, default: false },
  isFragile: { type: Boolean, default: false },
  isPerishable: { type: Boolean, default: false },
  isHazardous: { type: Boolean, default: false },
  isDigital: { type: Boolean, default: false },
  isService: { type: Boolean, default: false },
  ageRestricted: { type: Boolean, default: false },
  minAge: { type: Number, min: 0 },
  prescriptionRequired: { type: Boolean, default: false },
  prescriptionType: { type: String, enum: ["online", "physical"] }
}, { _id: false });

export const InventoryBaseSchema = new Schema({
  trackQuantity: { type: Boolean, default: true },
  stock: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  allowBackorder: { type: Boolean, default: false },
  stockLocation: { type: String },
  reorderPoint: { type: Number, default: 10 },
  backorderLimit: { type: Number },
  stockStatus: {
    type: String,
    enum: ["in_stock", "out_of_stock", "limited_stock"],
    default: "out_of_stock"
  }
}, { _id: false });

export const RatingDistributionSchema = new Schema({
  1: { type: Number, default: 0, min: 0 },
  2: { type: Number, default: 0, min: 0 },
  3: { type: Number, default: 0, min: 0 },
  4: { type: Number, default: 0, min: 0 },
  5: { type: Number, default: 0, min: 0 }
}, { _id: false });

export const RatingSummarySchema = new Schema({
  average: { type: Number, default: 0, min: 0, max: 5 },
  count: { type: Number, default: 0, min: 0 },
  totalReviews: { type: Number, default: 0, min: 0 },
  verifiedReviews: { type: Number, default: 0, min: 0 },
  helpfulVotes: { type: Number, default: 0, min: 0 },
  distribution: { type: RatingDistributionSchema, default: () => ({}) }
}, { _id: false });

export const DeliveryOptionsSchema = new Schema({
  estimatedDelivery: { type: String, required: true },
  estimatedDeliveryBangla: { type: String },
  availableFor: {
    type: String,
    enum: ["home_delivery", "pickup", "both"],
    default: "home_delivery"
  },
  cashOnDelivery: { type: Boolean, default: false },
  installationAvailable: { type: Boolean, default: false },
  installationCost: { type: Number, min: 0 }
}, { _id: false });