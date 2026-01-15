import { z } from "zod";
import { productZodSchema, productUpdateSchema } from "./product.validation.ts";

/**
 * Product DTOs (Data Transfer Objects)
 * Defines the shape of data entering and leaving the API.
 */

// Request DTOs (Zod inference)
export type CreateProductDTO = z.infer<typeof productZodSchema>;
export type UpdateProductDTO = z.infer<typeof productUpdateSchema>;

// Response DTOs
export interface ProductListResponseDTO {
  _id: string;
  name: string;
  sku: string;
  images: string[];
  pricing: {
    basePrice: number;
    salePrice: number;
    currency: string;
  };
  inventory: {
    totalStock: number;
  };
  statusInfo: {
    status: string;
    isPublished: boolean;
  };
}

export interface ProductDetailResponseDTO extends ProductListResponseDTO {
  description?: string;
  categories: any[];
  brands: any[];
  attributes: any;
}
