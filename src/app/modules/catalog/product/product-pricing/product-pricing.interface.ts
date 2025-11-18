import type { Document, Types } from "mongoose";
import type { TaxConfiguration } from "../product-shared/product-shared.interface.js";


export interface IProductPricing {
  product: Types.ObjectId;

  // Base Pricing
  basePrice: number;
  salePrice?: number;
  currency: "BDT" | "USD";
  costPrice: number;
  profitMargin: number;

  // Discount System
  discount: {
    amount: number;
    type: "percentage" | "fixed";
    startDate?: Date;
    endDate?: Date;
    isActive: boolean;
  };

  // Wholesale Pricing
  wholesaleTiers: {
    minQuantity: number;
    maxQuantity?: number;
    price: number;
    enabled: boolean;
  }[];

  // Commission
  commission: {
    rate: number;
    type: "percentage" | "fixed";
    calculationBase: "selling_price" | "base_price";
    minimumFee?: number;
  };

  // Tax Configuration (using shared type)
  tax: TaxConfiguration;

  // Flash Sale Pricing
  flashSale?: {
    price: number;
    stock: number;
    sold: number;
    startDate: Date;
    endDate: Date;
    limitPerCustomer: number;
  };

  // Price History
  priceHistory: {
    date: Date;
    basePrice: number;
    salePrice?: number;
    reason: "regular" | "sale" | "flash_sale" | "adjustment";
  }[];

  updatedAt: Date;
}

export type IProductPricingDocument = IProductPricing &
  Document & {
    calculateFinalPrice(quantity?: number): number;
    calculateCommission(quantity?: number): number;
    calculateTax(quantity?: number): number;
    isFlashSaleActive(): boolean;
  };