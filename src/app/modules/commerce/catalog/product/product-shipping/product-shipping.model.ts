import { Schema, model } from "mongoose";


import type { IProductShippingDocument } from "./product-shipping.interface.js";
import { DeliveryOptionsSchema, PhysicalPropertiesSchema } from "../product-shared/product-shared.model.js";

const productShippingSchema = new Schema<IProductShippingDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  
  // Physical Properties
  physicalProperties: { type: PhysicalPropertiesSchema, required: true },
  
  // Shipping Methods
  shippingMethods: [{
    method: { 
      type: String, 
      enum: ["standard", "express", "overnight", "international"],
      required: true 
    },
    cost: { type: Number, required: true, min: 0 },
    freeThreshold: { type: Number, min: 0 },
    estimatedDays: {
      min: { type: Number, required: true, min: 1 },
      max: { type: Number, required: true, min: 1 }
    },
    availableCountries: [{ type: String }],
    carrier: { type: String },
    isActive: { type: Boolean, default: true }
  }],
  
  // Delivery Options
  delivery: { type: DeliveryOptionsSchema, required: true },
  
  // Packaging
  packagingType: { type: String, required: true },
  shippingClass: { type: String, required: true }
}, {
  timestamps: true
});

// ==================== INSTANCE METHODS ====================

productShippingSchema.methods['calculateShipping'] = function(destination: string, method: string): number {
  const shippingMethod = this['shippingMethods'].find(
    (sm: any) => sm.method === method && sm.isActive
  );
  
  if (!shippingMethod) {
    throw new Error(`Shipping method '${method}' not available`);
  }
  
  // Check if destination is available
  if (shippingMethod.availableCountries.length > 0 && 
      !shippingMethod.availableCountries.includes(destination)) {
    throw new Error(`Shipping not available to ${destination}`);
  }
  
  return shippingMethod.cost;
};

productShippingSchema.methods['getAvailableShippingMethods'] = function(destination: string): any[] {
  return this['shippingMethods'].filter((method: any) => {
    if (!method.isActive) return false;
    
    // Check if destination is available for this method
    if (method.availableCountries.length > 0) {
      return method.availableCountries.includes(destination);
    }
    
    return true;
  }).map((method: any) => ({
    method: method.method,
    cost: method.cost,
    freeThreshold: method.freeThreshold,
    estimatedDays: method.estimatedDays,
    carrier: method.carrier
  }));
};

// ==================== INDEXES ====================

productShippingSchema.index({ product: 1 });
productShippingSchema.index({ 'shippingMethods.method': 1 });
productShippingSchema.index({ 'shippingMethods.isActive': 1 });

export const ProductShipping = model<IProductShippingDocument>('ProductShipping', productShippingSchema);