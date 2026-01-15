import { Schema, model } from "mongoose";

import type { IStockDocument, IOutletStock } from "./stock.interface.ts";
import { InventoryBaseSchema } from "@app/modules/catalog/index.ts";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";


const outletStockSchema = new Schema({
  outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
  stock: { type: Number, default: 0, min: 0 },
  reserved: { type: Number, default: 0, min: 0 },
  sold: { type: Number, default: 0, min: 0 }
}, { _id: false });

const stockSchema = new Schema<IStockDocument>({
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

stockSchema.methods['isInStock'] = function (this: IStockDocument, outletId?: string): boolean {
  if (outletId && this.outletStock) {
    const outletData = this.outletStock.find((os: IOutletStock) => os.outlet.toString() === outletId);
    if (!outletData) return false;
    return (outletData.stock - outletData.reserved) > 0;
  }
  return this.inventory.stockStatus === 'in_stock' ||
    this.inventory.stockStatus === 'limited_stock';
};

stockSchema.methods['canFulfillOrder'] = function (this: IStockDocument, quantity: number, outletId?: string): boolean {
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

stockSchema.methods['reserveStock'] = function (this: IStockDocument, quantity: number, outletId?: string): boolean {
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

stockSchema.methods['releaseStock'] = function (this: IStockDocument, quantity: number, outletId?: string): void {
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

stockSchema.methods['addStock'] = function (this: IStockDocument, quantity: number, outletId?: string): void {
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

stockSchema.methods['removeStock'] = function (this: IStockDocument, quantity: number, outletId?: string): void {
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

stockSchema.methods['updateStockStatus'] = function (this: IStockDocument): void {
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

stockSchema.pre('save', function (next) {
  (this as unknown as IStockDocument).updateStockStatus();
  next();
});

// ==================== INDEXES ====================

// stockSchema.index({ product: 1 }); // Covered by unique: true
stockSchema.index({ 'inventory.stockStatus': 1, lastRestockedAt: -1 }); // Sorted Dashboard Lists
stockSchema.index({ 'inventory.stock': 1 });
stockSchema.index({ lastRestockedAt: -1 });
stockSchema.index({ 'outletStock.outlet': 1 }); // Outlet Stock Queries
stockSchema.index({ 'suppliers.supplier': 1 }); // Supplier Relations

export const Stock = model<IStockDocument>('Stock', stockSchema);

// Apply Context-Aware Data Isolation
stockSchema.plugin(contextScopePlugin, {
  companyField: 'company',
  businessUnitField: 'businessUnit',
  outletField: 'outlet'
});
