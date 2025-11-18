import { Schema, model } from "mongoose";

import type { IProductInventoryDocument } from "./product-inventory.interface.js";
import { InventoryBaseSchema } from "../product-shared/product-shared.model.js";


const productInventorySchema = new Schema<IProductInventoryDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  
  // Stock Management
  inventory: { type: InventoryBaseSchema, required: true },
  
  // Supplier Management
  suppliers: [{
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplyPrice: { type: Number, required: true, min: 0 },
    moq: { type: Number, required: true, min: 1 }, // Minimum Order Quantity
    availableStock: { type: Number, default: 0, min: 0 },
    leadTime: { type: Number, required: true, min: 0 }, // Days
    priority: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true }
  }],
  
  // Restock History
  restockHistory: [{
    date: { type: Date, default: Date.now },
    quantity: { type: Number, required: true, min: 1 },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    cost: { type: Number, required: true, min: 0 }
  }],
  
  lastRestockedAt: { type: Date }
}, {
  timestamps: true
});

// ==================== INSTANCE METHODS ====================

productInventorySchema.methods['isInStock'] = function(): boolean {
  return this['inventory'].stockStatus === 'in_stock' || 
         this['inventory'].stockStatus === 'limited_stock';
};

productInventorySchema.methods['canFulfillOrder'] = function(quantity: number): boolean {
  if (!this['isInStock']()) return false;
  
  const availableStock = this['inventory'].stock - this['inventory'].reserved;
  
  if (availableStock >= quantity) return true;
  
  // Check if we can backorder
  if (this['inventory'].allowBackorder) {
    const backorderAvailable = this['inventory'].backorderLimit 
      ? this['inventory'].backorderLimit - (this['inventory'].sold + this['inventory'].reserved)
      : Number.MAX_SAFE_INTEGER;
    return backorderAvailable >= quantity;
  }
  
  return false;
};

productInventorySchema.methods['reserveStock'] = function(quantity: number): boolean {
  if (!this['canFulfillOrder'](quantity)) return false;
  
  const availableStock = this['inventory'].stock - this['inventory'].reserved;
  
  if (availableStock >= quantity) {
    this['inventory'].reserved += quantity;
  } else if (this['inventory'].allowBackorder) {
    this['inventory'].reserved += quantity;
  } else {
    return false;
  }
  
  this['updateStockStatus']();
  return true;
};

productInventorySchema.methods['releaseStock'] = function(quantity: number): void {
  this['inventory'].reserved = Math.max(0, this['inventory'].reserved - quantity);
  this['updateStockStatus']();
};

// ==================== HELPER METHODS ====================

productInventorySchema.methods['updateStockStatus'] = function(): void {
  const availableStock = this['inventory'].stock - this['inventory'].reserved;
  
  if (availableStock <= 0) {
    this['inventory'].stockStatus = 'out_of_stock';
  } else if (availableStock <= this['inventory'].lowStockThreshold) {
    this['inventory'].stockStatus = 'limited_stock';
  } else {
    this['inventory'].stockStatus = 'in_stock';
  }
};

// ==================== PRE-SAVE MIDDLEWARE ====================

productInventorySchema.pre('save', function(next) {
  (this as any).updateStockStatus();
  next();
});

// ==================== INDEXES ====================

productInventorySchema.index({ product: 1 });
productInventorySchema.index({ 'inventory.stockStatus': 1 });
productInventorySchema.index({ 'inventory.stock': 1 });
productInventorySchema.index({ lastRestockedAt: -1 });

export const ProductInventory = model<IProductInventoryDocument>('ProductInventory', productInventorySchema);