import { Schema, model } from "mongoose";


import type { IProductDetails, IProductDetailsDocument } from "./product-details.interface.js";
import { PhysicalPropertiesSchema, ProductAttributesSchema } from "../product-shared/product-shared.model.js";

const productDetailsSchema = new Schema<IProductDetails>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },

  // Rich Content
  description: { type: String, required: true },
  descriptionLocalized: { type: String },
  shortDescription: { type: String, required: true },
  keyFeatures: [{ type: String }],
  keyFeaturesLocalized: [{ type: String }],

  // Specifications
  specifications: [{
    group: { type: String, required: true },
    items: [{
      key: { type: String, required: true },
      value: { type: String, required: true },
      unit: { type: String },
      icon: { type: String }
    }]
  }],

  // Media Assets
  images: [{ type: String, required: true }],
  videos: [{ type: String }],
  gallery: [{
    type: { type: String, enum: ["image", "video", "3d_model"], required: true },
    url: { type: String, required: true },
    altText: { type: String },
    sortOrder: { type: Number, default: 0 }
  }],

  // Combined Attributes
  attributes: {
    ...ProductAttributesSchema.obj,
    ...PhysicalPropertiesSchema.obj
  },

  // Origin & Manufacturing
  origin: { type: String, required: true },
  manufacturer: { type: String },
  model: { type: String },
  barcode: { type: String },
  hscode: { type: String }
}, {
  timestamps: true
});

// ==================== INDEXES ====================

productDetailsSchema.index({ product: 1 });
productDetailsSchema.index({ origin: 1 });
productDetailsSchema.index({ manufacturer: 1 });

export const ProductDetails = model<IProductDetails>('ProductDetails', productDetailsSchema);