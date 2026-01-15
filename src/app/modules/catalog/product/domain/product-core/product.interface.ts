import type { Document, Model, Types } from "mongoose";
import type {
  SEOData,
  TaxConfiguration,
  BundleProduct,
  ProductStatus,
  ProductAttributes,
  RatingSummary,
  DeliveryOptions,
} from "../../product-shared/product-shared.interface.ts";

export interface IProductCore {
  name: string;
  nameBangla?: string;
  domain: string;
  slug: string;
  sku: string;
  barcode?: string;
  // Module Availability (Omnichannel Control)
  availableModules: ('pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system')[];
  translations?: {
    lang: string;
    field: string;
    value: string;
  }[];
  unit?: Types.ObjectId;
  company: Types.ObjectId;
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

export type IProductDocument = IProductCore & Document & {
    isNewProduct: boolean;
    isBundleProduct: boolean;
    hasVariantsAvailable: boolean;

    addToWishlist(): Promise<void>;
  };

export interface IProductModel extends Model<IProductDocument> {
  findByOutlet(outletId: string | Types.ObjectId): Promise<IProductDocument[]>;
  searchProducts(query: string, filters?: any): Promise<IProductDocument[]>;
  getSimilarProducts(
    productId: string | Types.ObjectId,
    limit?: number
  ): Promise<IProductDocument[]>;
}
