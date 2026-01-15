import type { DeliveryOptions, PhysicalProperties } from "@app/modules/catalog/index.ts";
import type { Document, Types } from "mongoose";


export interface IProductShipping {
  product: Types.ObjectId;

  // Physical Properties (using shared type)
  physicalProperties: PhysicalProperties;

  // Shipping Methods
  shippingMethods: {
    method: "standard" | "express" | "overnight" | "international";
    cost: number;
    freeThreshold?: number;
    estimatedDays: {
      min: number;
      max: number;
    };
    availableCountries: string[];
    carrier?: string;
    isActive: boolean;
  }[];

  // Delivery Options (using shared type)
  delivery: DeliveryOptions;

  // Packaging
  packagingType: string;
  shippingClass: string;

  updatedAt: Date;
}

export type IProductShippingDocument = IProductShipping & Document & {
  calculateShipping(destination: string, method: string): number;
  getAvailableShippingMethods(destination: string): any[];
};