import { Schema, model } from "mongoose";


import type { IProductVariantDocument } from "./product-variant.interface.js";
import { PhysicalPropertiesSchema } from "../product-shared/product-shared.model.js";

const productVariantSchema = new Schema<IProductVariantDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  hasVariants: { type: Boolean, default: false },

  variantAttributes: [{
    name: { type: String, required: true },
    values: [{ type: String, required: true }],
    displayType: {
      type: String,
      enum: ["text", "color", "image"],
      default: "text"
    },
    sortOrder: { type: Number, default: 0 }
  }],

  variants: [{
    variantId: { type: String, required: true },
    parentProduct: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, unique: true, sparse: true }, // Changed to Unique

    // Attributes
    attributes: { type: Map, of: String }, // { size: "XL", color: "Red" }

    // Pricing
    pricing: {
      basePrice: { type: Number, required: true, min: 0 },
      salePrice: { type: Number, min: 0 },
      costPrice: { type: Number, required: true, min: 0 },
      currency: { type: String, enum: ["BDT", "USD"], default: "BDT" }
    },

    // Inventory
    inventory: {
      stock: { type: Number, default: 0, min: 0 },
      reserved: { type: Number, default: 0, min: 0 },
      sold: { type: Number, default: 0, min: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      allowBackorder: { type: Boolean, default: false }
    },

    // Media
    images: [{ type: String }],

    // Physical Properties
    physicalProperties: { type: PhysicalPropertiesSchema },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    isDefault: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

// ==================== INSTANCE METHODS ====================

productVariantSchema.methods['findVariantByAttributes'] = function (attributes: Record<string, string>) {
  return this['variants'].find((variant: any) => {
    return Object.keys(attributes).every(key =>
      variant.attributes.get(key) === attributes[key]
    );
  });
};

productVariantSchema.methods['getAvailableVariants'] = function () {
  return this['variants'].filter((variant: any) =>
    variant.status === 'active' &&
    (variant.inventory.stock > 0 || variant.inventory.allowBackorder)
  );
};

productVariantSchema.methods['getDefaultVariant'] = function () {
  return this['variants'].find((variant: any) => variant.isDefault) || this['variants'][0];
};

// ==================== VIRTUAL PROPERTIES ====================

productVariantSchema.virtual('availableVariants').get(function () {
  return (this as any)['getAvailableVariants']();
});

productVariantSchema.virtual('defaultVariant').get(function () {
  return (this as any)['getDefaultVariant']();
});

// ==================== PRE-SAVE MIDDLEWARE ====================

productVariantSchema.pre('save', function (next) {
  // Ensure only one variant is set as default
  if (this['variants'].filter((v: any) => v.isDefault).length > 1) {
    const defaultVariants = this['variants'].filter((v: any) => v.isDefault);
    for (let i = 1; i < defaultVariants.length; i++) {
      (defaultVariants as any)[i].isDefault = false;
    }
  }
  next();
});

// ==================== INDEXES ====================

// productVariantSchema.index({ product: 1 }); // Covered by unique: true
// productVariantSchema.index({ 'variants.sku': 1 }); // Covered by unique: true nested
productVariantSchema.index({ 'variants.status': 1 });
productVariantSchema.index({ 'variants.isDefault': 1 });

export const ProductVariant = model<IProductVariantDocument>('ProductVariant', productVariantSchema);