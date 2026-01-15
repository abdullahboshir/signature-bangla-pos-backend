import type { Document, Types } from "mongoose";
import type { PhysicalProperties, ProductAttributes } from "../../product-shared/product-shared.interface.ts";


export interface IProductDetails {
  product: Types.ObjectId;
  description: string;
  descriptionLocalized?: string;
  shortDescription: string;
  keyFeatures: string[];
  keyFeaturesLocalized?: string[];

  // Specifications
  specifications: {
    group: string;
    items: {
      key: string;
      value: string;
      unit?: string;
      icon?: string;
    }[];
  }[];

  // Media Assets
  images: string[];
  videos?: string[];
  gallery: {
    type: "image" | "video" | "3d_model";
    url: string;
    altText?: string;
    sortOrder: number;
  }[];

  // Combined Attributes
  attributes: ProductAttributes & PhysicalProperties;

  // Origin & Manufacturing
  origin: string;
  manufacturer?: string;
  model?: string;
  barcode?: string;
  hscode?: string;

  createdAt: Date;
  updatedAt: Date;
}

export type IProductDetailsDocument = IProductDetails & Document;