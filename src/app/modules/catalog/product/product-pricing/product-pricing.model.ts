import { Schema, model } from "mongoose";

import type { IProductPricingDocument } from "./product-pricing.interface.js";
import { TaxConfigurationSchema } from "../product-shared/product-shared.model.js";

const productPricingSchema = new Schema<IProductPricingDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },

  // Base Pricing
  basePrice: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  currency: { type: String, enum: ["BDT", "USD"], default: "BDT" },
  costPrice: { type: Number, required: true, min: 0 },
  profitMargin: { type: Number, required: true, min: 0 },
  profitMarginType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },

  // Discount System
  discount: {
    amount: { type: Number, default: 0, min: 0 },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: false }
  },

  // Wholesale Pricing
  wholesaleTiers: [{
    minQuantity: { type: Number, required: true, min: 1 },
    maxQuantity: { type: Number, min: 1 },
    price: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true }
  }],

  // Commission
  commission: {
    rate: { type: Number, default: 0, min: 0, max: 100 },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    calculationBase: { type: String, enum: ["selling_price", "base_price"], default: "selling_price" },
    minimumFee: { type: Number, default: 0, min: 0 }
  },

  // Tax Configuration
  tax: { type: TaxConfigurationSchema, required: true },

  // Flash Sale Pricing
  flashSale: {
    price: { type: Number, min: 0 },
    stock: { type: Number, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    limitPerCustomer: { type: Number, min: 1 }
  },

  // Price History
  priceHistory: [{
    date: { type: Date, default: Date.now },
    basePrice: { type: Number, required: true },
    salePrice: { type: Number },
    reason: {
      type: String,
      enum: ["regular", "sale", "flash_sale", "adjustment"],
      default: "regular"
    }
  }]
}, {
  timestamps: true
});

// ==================== INSTANCE METHODS ====================

productPricingSchema.methods['calculateFinalPrice'] = function (quantity: number = 1): number {
  let finalPrice = this['basePrice'];

  // Apply sale price if available
  if (this['salePrice'] && this['salePrice'] > 0) {
    finalPrice = this['salePrice'];
  }

  // Apply discount if active
  if (this['discount'].isActive && this['isDiscountActive']()) {
    if (this['discount'].type === 'percentage') {
      finalPrice = finalPrice * (1 - this['discount'].amount / 100);
    } else {
      finalPrice = Math.max(0, finalPrice - this['discount'].amount);
    }
  }

  // Apply wholesale pricing
  if (this['wholesaleTiers'] && this['wholesaleTiers'].length > 0) {
    const applicableTier = this['wholesaleTiers']
      .filter((tier: any) => tier.enabled)
      .sort((a: { minQuantity: number }, b: { minQuantity: number }) => b.minQuantity - a.minQuantity)
      .find((tier: any) => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity));

    if (applicableTier) {
      finalPrice = applicableTier.price;
    }
  }

  // Apply flash sale if active
  if (this['isFlashSaleActive']()) {
    finalPrice = this['flashSale']!.price;
  }

  return Math.max(0, finalPrice * quantity);
};

productPricingSchema.methods['calculateCommission'] = function (quantity: number = 1): number {
  const finalPrice = this['calculateFinalPrice'](quantity);
  let commission = 0;

  if (this['commission'].type === 'percentage') {
    commission = finalPrice * (this['commission'].rate / 100);
  } else {
    commission = this['commission'].rate;
  }

  if (this['commission'].minimumFee && commission < this['commission'].minimumFee) {
    commission = this['commission'].minimumFee;
  }

  return commission;
};

productPricingSchema.methods['calculateTax'] = function (quantity: number = 1): number {
  if (!this['tax'].taxable) return 0;

  const finalPrice = this['calculateFinalPrice'](quantity);

  if (this['tax'].taxInclusive) {
    return finalPrice * (this['tax'].taxRate / (100 + this['tax'].taxRate));
  } else {
    return finalPrice * (this['tax'].taxRate / 100);
  }
};

productPricingSchema.methods['isFlashSaleActive'] = function (): boolean {
  if (!this['flashSale']) return false;

  const now = new Date();
  return this['flashSale'].startDate <= now &&
    this['flashSale'].endDate >= now &&
    this['flashSale'].stock > this['flashSale'].sold;
};

// ==================== HELPER METHODS ====================

productPricingSchema.methods['isDiscountActive'] = function (): boolean {
  if (!this['discount'].isActive) return false;

  const now = new Date();
  const hasStarted = !this['discount'].startDate || this['discount'].startDate <= now;
  const hasEnded = this['discount'].endDate && this['discount'].endDate < now;

  return hasStarted && !hasEnded;
};

// ==================== INDEXES ====================

productPricingSchema.index({ product: 1 });
productPricingSchema.index({ 'discount.isActive': 1 });
productPricingSchema.index({ 'flashSale.startDate': 1, 'flashSale.endDate': 1 });

export const ProductPricing = model<IProductPricingDocument>('ProductPricing', productPricingSchema);