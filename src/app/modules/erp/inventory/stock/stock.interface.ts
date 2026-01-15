import type { Document, Types } from "mongoose";
import type { InventoryBase } from "@app/modules/catalog/index.ts";

export interface IOutletStock {
  outlet: Types.ObjectId;
  stock: number;
  reserved: number;
  sold: number;
}


export interface IStock {
  product: Types.ObjectId;
  company: Types.ObjectId;
  businessUnit: Types.ObjectId;
  domain: string;
  outlet?: Types.ObjectId;

  // Stock Management (using shared base)
  inventory: InventoryBase;

  // Multi-Outlet Stock
  outletStock: IOutletStock[];

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

export type IStockDocument = IStock &
  Document & {
    isInStock(outletId?: string): boolean;
    canFulfillOrder(quantity: number, outletId?: string): boolean;
    reserveStock(quantity: number, outletId?: string): boolean;
    releaseStock(quantity: number, outletId?: string): void;
    addStock(quantity: number, outletId?: string): void;
    removeStock(quantity: number, outletId?: string): void;
    updateStockStatus(): void;
  };