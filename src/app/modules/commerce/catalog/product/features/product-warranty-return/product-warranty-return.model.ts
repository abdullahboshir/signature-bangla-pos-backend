import { Schema, model } from "mongoose";
import type { IProductWarrantyReturnsDocument } from "./product-warranty-return.interface.js";

const productWarrantyReturnSchema = new Schema<IProductWarrantyReturnsDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  
  warranty: {
    hasWarranty: { type: Boolean, default: false },
    type: { 
      type: String, 
      enum: ["seller", "manufacturer", "brand"],
      default: "seller" 
    },
    duration: { type: Number, min: 0 },
    periodUnit: { 
      type: String, 
      enum: ["days", "months", "years"],
      default: "months" 
    },
    details: { type: String },
    serviceCenters: [{ type: String }],
    termsConditions: { type: String }
  },
  
  returnPolicy: {
    allowed: { type: Boolean, default: true },
    period: { type: Number, default: 7, min: 0 }, // Days
    conditions: [{ type: String }],
    refundMethods: [{
      type: String,
      enum: ["wallet", "original_payment", "bank_transfer"]
    }],
    returnShipping: { 
      type: String, 
      enum: ["seller_paid", "buyer_paid"],
      default: "buyer_paid" 
    },
    nonReturnableConditions: [{ type: String }]
  }
}, {
  timestamps: true
});

// ==================== INSTANCE METHODS ====================

productWarrantyReturnSchema.methods['isReturnAllowed'] = function(purchaseDate: Date): boolean {
  if (!this['returnPolicy'].allowed) return false;
  
  const returnDeadline = new Date(purchaseDate);
  returnDeadline.setDate(returnDeadline.getDate() + this['returnPolicy'].period);
  
  return new Date() <= returnDeadline;
};

productWarrantyReturnSchema.methods['isUnderWarranty'] = function(purchaseDate: Date): boolean {
  if (!this['warranty'].hasWarranty) return false;
  
  const warrantyEndDate = new Date(purchaseDate);
  
  switch (this['warranty'].periodUnit) {
    case 'days':
      warrantyEndDate.setDate(warrantyEndDate.getDate() + this['warranty'].duration);
      break;
    case 'months':
      warrantyEndDate.setMonth(warrantyEndDate.getMonth() + this['warranty'].duration);
      break;
    case 'years':
      warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + this['warranty'].duration);
      break;
  }
  
  return new Date() <= warrantyEndDate;
};

// ==================== INDEXES ====================

productWarrantyReturnSchema.index({ product: 1 });
productWarrantyReturnSchema.index({ 'warranty.hasWarranty': 1 });
productWarrantyReturnSchema.index({ 'returnPolicy.allowed': 1 });

export const ProductWarrantyReturn = model<IProductWarrantyReturnsDocument>('ProductWarrantyReturn', productWarrantyReturnSchema);