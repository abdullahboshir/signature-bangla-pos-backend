import type { Types } from "mongoose";

export interface SEOData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
}

export interface TaxConfiguration {
  taxable: boolean;
  taxClass: string;
  taxRate: number;
  taxInclusive: boolean;
  hscode?: string;
}

export interface BundleProduct {
  product: Types.ObjectId;
  quantity: number;
  discount?: number;
}

export interface ProductStatus {
  status: "draft" | "under_review" | "published" | "rejected" | "archived" | "suspended";
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  publishedAt?: Date;
}

export interface PhysicalProperties {
  weight?: number;
  weightUnit?: "kg" | "g" | "lb";
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "inch";
  };
}

export interface ProductAttributes {
  isOrganic: boolean;
  isElectric: boolean;
  isFragile: boolean;
  isPerishable: boolean;
  isHazardous: boolean;
  isDigital: boolean;
  isService: boolean;
  ageRestricted: boolean;
  minAge?: number;
  prescriptionRequired: boolean;
  prescriptionType?: "online" | "physical";
}

export interface InventoryBase {
  trackQuantity: boolean;
  stock: number;
  reserved: number;
  sold: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  stockLocation?: string;
  reorderPoint: number;
  backorderLimit?: number;
  stockStatus: "in_stock" | "out_of_stock" | "limited_stock";
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingSummary {
  average: number;
  count: number;
  totalReviews: number;
  verifiedReviews: number;
  helpfulVotes: number;
  distribution: RatingDistribution;
}

export interface DeliveryOptions {
  estimatedDelivery: string;
  estimatedDeliveryBangla?: string;
  availableFor: "home_delivery" | "pickup" | "both";
  cashOnDelivery: boolean;
  installationAvailable: boolean;
  installationCost?: number;
}