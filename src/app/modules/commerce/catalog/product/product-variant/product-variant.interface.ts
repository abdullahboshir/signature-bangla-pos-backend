import type { Document, Types } from "mongoose";
import type { PhysicalProperties } from "../product-shared/product-shared.interface.js";


export interface IProductVariant {
  variantId: string;
  parentProduct: Types.ObjectId;
  sku: string;
  barcode?: string;
  
  // Attributes
  attributes: {
    [key: string]: string;
  };
  
  // Pricing
  pricing: {
    basePrice: number;
    salePrice?: number;
    costPrice: number;
    currency: "BDT" | "USD";
  };
  
  // Inventory
  inventory: {
    stock: number;
    reserved: number;
    sold: number;
    lowStockThreshold: number;
    allowBackorder: boolean;
  };
  
  // Media
  images: string[];
  
  // Physical Properties (using shared type)
  physicalProperties: PhysicalProperties;
  
  status: "active" | "inactive";
  isDefault: boolean;
  sortOrder: number;
}

export interface IProductVariantTemplate {
  product: Types.ObjectId;
  hasVariants: boolean;
  variantAttributes: {
    name: string;
    values: string[];
    displayType: "text" | "color" | "image";
    sortOrder: number;
  }[];
  
  variants: IProductVariant[];
}

export type IProductVariantDocument = IProductVariantTemplate & Document;