import type { Document, Types } from "mongoose";
import type { InventoryBase } from "../product-shared/product-shared.interface.js";


export interface IProductInventory {
  product: Types.ObjectId;

  // Stock Management (using shared base)
  inventory: InventoryBase;

  // Supplier Management
  suppliers: {
    supplier: Types.ObjectId;
    supplyPrice: number;
    moq: number;
    availableStock: number;
    leadTime: number;
    priority: number;
    isActive: boolean;
  }[];

  // Restock History
  restockHistory: {
    date: Date;
    quantity: number;
    supplier: Types.ObjectId;
    cost: number;
  }[];

  lastRestockedAt?: Date;
  updatedAt: Date;
}

export type IProductInventoryDocument = IProductInventory &
  Document & {
    isInStock(): boolean;
    canFulfillOrder(quantity: number): boolean;
    reserveStock(quantity: number): boolean;
    releaseStock(quantity: number): void;
  };