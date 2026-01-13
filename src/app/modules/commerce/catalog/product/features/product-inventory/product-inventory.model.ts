import { Schema, model } from "mongoose";

import type { IProductInventoryDocument, IOutletStock } from "./product-inventory.interface.js";
import { InventoryBaseSchema } from "../../product-shared/product-shared.model.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";


const outletStockSchema = new Schema({
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
  stock: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0, min: 0 }
}, { _id: false });

const productInventorySchema = new Schema<IProductInventoryDocument>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
  domain: {
    type: String,
    enum: ["retail", "pharmacy", "grocery", "restaurant", "electronics", "fashion", "service", "construction", "automotive", "health", "hospitality", "other"],
    default: "retail",
    index: true
  },
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },

  // Stock Management
  inventory: { type: InventoryBaseSchema, required: true },

  // Multi-Outlet Stock
  outletStock: [outletStockSchema],

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

productInventorySchema.methods['isInStock'] = function (this: IProductInventoryDocument, outletId?: string): boolean {
  if (outletId && this.outletStock) {
    const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
    if (!outletData) return false;
    return (outletData.stock - outletData.reserved) > 0;
  }
  return this.inventory.stockStatus === 'in_stock' ||
    this.inventory.stockStatus === 'limited_stock';
};

productInventorySchema.methods['canFulfillOrder'] = function (this: IProductInventoryDocument, quantity: number, outletId?: string): boolean {
  // If Outlet ID provided, check specific outlet stock
  if (outletId && this.outletStock) {
    const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
    if (!outletData) return false;

    const available = outletData.stock - outletData.reserved;
    if (available >= quantity) return true;
  }

  // Fallback / Global Logic
  if (!outletId) {
    // Cast to any to avoid circular strict check issues if needed, or rely on internal method
    // But since we are inside the model methods, we can just call this.inventory check
    if (!this.isInStock()) return false;
    const availableStock = this.inventory.stock - this.inventory.reserved;
    if (availableStock >= quantity) return true;
  }

  // Check Backorder (Global Policy)
  if (this.inventory.allowBackorder) {
    const backorderAvailable = this.inventory.backorderLimit
      ? this.inventory.backorderLimit - (this.inventory.sold + this.inventory.reserved)
      : Number.MAX_SAFE_INTEGER;
    return backorderAvailable >= quantity;
  }

  return false;
};

productInventorySchema.methods['reserveStock'] = function (this: IProductInventoryDocument, quantity: number, outletId?: string): boolean {
  if (!this.canFulfillOrder(quantity, outletId)) return false;

  // 1. Reserve Global (Always sync global to reflect total reserved)
  const availableStock = this.inventory.stock - this.inventory.reserved;

  if (availableStock >= quantity || this.inventory.allowBackorder) {
    this.inventory.reserved += quantity;

    // 2. Reserve Outlet Specific
    if (outletId && this.outletStock) {
      const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
      if (outletData) {
        outletData.reserved += quantity;
      }
    }
  } else {
    return false;
  }

  this.updateStockStatus();
  return true;
};

productInventorySchema.methods['releaseStock'] = function (this: IProductInventoryDocument, quantity: number, outletId?: string): void {
  // Release Global
  this.inventory.reserved = Math.max(0, this.inventory.reserved - quantity);

  // Release Outlet
  if (outletId && this.outletStock) {
    const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
    if (outletData) {
      outletData.reserved = Math.max(0, outletData.reserved - quantity);
    }
  }

  this.updateStockStatus();
};

productInventorySchema.methods['addStock'] = function (this: IProductInventoryDocument, quantity: number, outletId?: string): void {
  // Add to Global
  this.inventory.stock += quantity;

  // Add to Outlet
  if (outletId) {
    // Check if outlet entry exists, if not create it
    let outletData = this.outletStock?.find((os: IOutletStock) => os.outlet.toString() === outletId);

    if (outletData) {
      outletData.stock += quantity;
    } else {
      // Create new outlet entry
      if (!this.outletStock) this.outletStock = [];
      this.outletStock.push({
        outlet: outletId,
        stock: quantity,
        reserved: 0,
        sold: 0
      } as any);
    }
  }

  this.updateStockStatus();
};

productInventorySchema.methods['removeStock'] = function (this: IProductInventoryDocument, quantity: number, outletId?: string): void {
  // Remove from Global
  this.inventory.stock -= quantity;

  // Remove from Outlet
  if (outletId && this.outletStock) {
    const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
    if (outletData) {
      outletData.stock -= quantity;
    }
  }

  this.updateStockStatus();
};

// ==================== HELPER METHODS ====================

productInventorySchema.methods['updateStockStatus'] = function (this: IProductInventoryDocument): void {
  const availableStock = this.inventory.stock - this.inventory.reserved;

  if (availableStock <= 0) {
    this.inventory.stockStatus = 'out_of_stock';
  } else if (availableStock <= this.inventory.lowStockThreshold) {
    this.inventory.stockStatus = 'limited_stock';
  } else {
    this.inventory.stockStatus = 'in_stock';
  }
};

// ==================== PRE-SAVE MIDDLEWARE ====================

productInventorySchema.pre('save', function (next) {
  (this as unknown as IProductInventoryDocument).updateStockStatus();
  next();
});

// ==================== INDEXES ====================

// productInventorySchema.index({ product: 1 }); // Covered by unique: true
productInventorySchema.index({ 'inventory.stockStatus': 1, lastRestockedAt: -1 }); // Sorted Dashboard Lists
productInventorySchema.index({ 'inventory.stock': 1 });
productInventorySchema.index({ lastRestockedAt: -1 });
productInventorySchema.index({ 'outletStock.outlet': 1 }); // Outlet Stock Queries
productInventorySchema.index({ 'suppliers.supplier': 1 }); // Supplier Relations

export const ProductInventory = model<IProductInventoryDocument>('ProductInventory', productInventorySchema);

// Apply Context-Aware Data Isolation
productInventorySchema.plugin(contextScopePlugin, {
  companyField: 'company',
  businessUnitField: 'businessUnit',
  outletField: 'outlet'
});