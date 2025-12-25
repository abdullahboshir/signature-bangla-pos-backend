import type { Document, Model, Types } from "mongoose";
import type {
  SEOData,
  TaxConfiguration,
  BundleProduct,
  ProductStatus,
  ProductAttributes,
  RatingSummary,
  DeliveryOptions,
} from "../product-shared/product-shared.interface.js";

export interface IProductCore {
  name: string;
  nameBangla?: string;
  slug: string;
  sku: string;
  barcode?: string;
  translations?: {
    lang: string;
    field: string;
    value: string;
  }[];
  unit?: Types.ObjectId;
  outlet: Types.ObjectId;
  businessUnit: Types.ObjectId;
  vendor: {
    id: Types.ObjectId;
    name: string;
    rating: number;
    isVerified: boolean;
  };
  categories: Types.ObjectId[];
  primaryCategory: Types.ObjectId;
  subCategory?: Types.ObjectId;
  childCategory?: Types.ObjectId;
  crossSellProducts?: Types.ObjectId[];
  upsellProducts?: Types.ObjectId[];
  brands: Types.ObjectId[];
  tags: string[];
  tagsBangla?: string[];
  images: string[];
  videos?: string[];

  pricing: Types.ObjectId;
  inventory: Types.ObjectId;
  shipping: Types.ObjectId;
  warranty: Types.ObjectId;
  details: Types.ObjectId;
  origine: string;
  variantTemplate?: Types.ObjectId;
  hasVariants: boolean;
  isBundle: boolean;
  bundleProducts: BundleProduct[];
  bundleDiscount: number;
  ratings: RatingSummary;
  delivery: DeliveryOptions;
  attributes: ProductAttributes;
  productmodel?: string;
  tax: TaxConfiguration;
  compliance: {
    hasCertification: boolean;
    certifications: string[];
    importRestrictions: string[];
    safetyStandards: string[];
  };

  marketing: {
    isFeatured: boolean;
    isNew: boolean;
    isPopular: boolean;
    isBestSeller: boolean;
    isTrending: boolean;
    seo: SEOData;
    socialShares: number;
    wishlistCount: number;
  };

  statusInfo: ProductStatus;

  createdAt: Date;
  updatedAt: Date;
  lastRestockedAt?: Date;

  isDeleted?: boolean; // Should be select: false in schema, so optional here for general usage
  deletedAt?: Date;
}

export type IProductDocument = IProductCore &
  Document & {
    discountedPrice: number;
    finalPrice: number;
    isOnSale: boolean;
    isNewProduct: boolean;
    isLowStock: boolean;
    isOutOfStock: boolean;
    isFlashSaleActive: boolean;
    isBundleProduct: boolean;
    hasVariantsAvailable: boolean;
    stockPercentage: number;
    estimatedProfit: number;

    isInStock(): boolean;
    getMaxPurchaseQuantity(): number;
    canOrderQuantity(quantity: number): boolean;
    updateStock(quantity: number, operation: "add" | "subtract"): Promise<void>;
    reserveStock(quantity: number): Promise<boolean>;
    releaseStock(quantity: number): Promise<void>;
    calculateCommission(): number;
    calculateTax(quantity: number): number;
    getShippingCost(destination: string, method: string): number;
    addToWishlist(): Promise<void>;
    incrementViewCount(): Promise<void>;
    updateRatingStats(): Promise<void>;
  };

export interface IProductModel extends Model<IProductDocument> {
  findFeatured(): Promise<IProductDocument[]>;
  findByCategory(
    categoryId: string | Types.ObjectId
  ): Promise<IProductDocument[]>;
  findByOutlet(outletId: string | Types.ObjectId): Promise<IProductDocument[]>;
  findTrending(limit?: number): Promise<IProductDocument[]>;
  findFlashSales(): Promise<IProductDocument[]>;
  findLowStock(): Promise<IProductDocument[]>;
  searchProducts(query: string, filters?: any): Promise<IProductDocument[]>;
  getSimilarProducts(
    productId: string | Types.ObjectId,
    limit?: number
  ): Promise<IProductDocument[]>;
  updateBulkPrices(products: string[], updateData: any): Promise<void>;
  getProductAnalytics(productId: string | Types.ObjectId): Promise<any>;

  getCategoryStats(categoryId: string | Types.ObjectId): Promise<any>;
  getBrandStats(brandId: string | Types.ObjectId): Promise<any>;
  getVendorStats(vendorId: string | Types.ObjectId): Promise<any>;
  getSalesReport(startDate: Date, endDate: Date): Promise<any>;
}
