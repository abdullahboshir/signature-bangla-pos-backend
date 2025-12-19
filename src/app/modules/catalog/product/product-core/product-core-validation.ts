import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

// Helper for ObjectId validation
const objectIdSchema = z.string().refine((val) => isValidObjectId(val), {
  message: 'Invalid ObjectId',
});

// Shared Schemas
const seoSchema = z.object({
  slug: z.string().optional(), // Can be generated
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  ogImage: z.string().url().optional().or(z.literal('')),
});

const taxSchema = z.object({
  taxable: z.boolean().default(false),
  taxClass: z.string().min(1),
  taxRate: z.number().min(0).default(0),
  taxInclusive: z.boolean().default(false),
  hscode: z.string().optional(),
});

const deliveryOptionsSchema = z.object({
  estimatedDelivery: z.string().min(1),
  estimatedDeliveryBangla: z.string().optional(),
  availableFor: z.enum(["home_delivery", "pickup", "both"]).default("home_delivery"),
  cashOnDelivery: z.boolean().default(false),
  installationAvailable: z.boolean().default(false),
  installationCost: z.number().min(0).optional(),
});

// Sub-Module Schemas

// 1. Pricing
const pricingSchema = z.object({
  basePrice: z.number().min(0),
  salePrice: z.number().min(0).optional(),
  currency: z.enum(["BDT", "USD"]).default("BDT"),
  costPrice: z.number().min(0),
  profitMargin: z.number().min(0),
  profitMarginType: z.enum(["percentage", "fixed"]).default("percentage"),
  discount: z.object({
    amount: z.number().min(0).default(0),
    type: z.enum(["percentage", "fixed"]).default("percentage"),
    startDate: z.string().optional(), // Date string
    endDate: z.string().optional(),
    isActive: z.boolean().default(false)
  }).optional(),
  tax: taxSchema,
  commission: z.object({
    rate: z.number().min(0).max(100),
    type: z.enum(["percentage", "fixed"]).default("percentage"),
    calculationBase: z.enum(["selling_price", "base_price"]).default("selling_price"),
    minimumFee: z.number().min(0).optional()
  }).optional(),
});

// 2. Inventory
const supplierSchema = z.object({
  supplier: objectIdSchema,
  supplyPrice: z.number().min(0),
  moq: z.number().min(1),
  availableStock: z.number().min(0).default(0),
  leadTime: z.number().min(0),
  priority: z.number().min(1).default(1),
  isActive: z.boolean().default(true)
});

const inventorySchema = z.object({
  inventory: z.object({
    trackQuantity: z.boolean().default(true),
    stock: z.number().min(0),
    lowStockThreshold: z.number().default(5),
    allowBackorder: z.boolean().default(false),
    stockLocation: z.string().optional(),
    reorderPoint: z.number().default(10),
    stockStatus: z.enum(["in_stock", "out_of_stock", "limited_stock"]).optional()
  }),
  suppliers: z.array(supplierSchema).optional(),
});

// 3. Details
const detailsSchema = z.object({
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  keyFeatures: z.array(z.string()).optional(),
  specifications: z.array(z.object({
    group: z.string(),
    items: z.array(z.object({
      key: z.string(),
      value: z.string(),
      unit: z.string().optional(),
      icon: z.string().optional()
    }))
  })).optional(),
  images: z.array(z.string().url()).min(1),
  videos: z.array(z.string().url()).optional(),
  gallery: z.array(z.object({
    type: z.enum(["image", "video", "3d_model"]),
    url: z.string().url(),
    altText: z.string().optional(),
    sortOrder: z.number().default(0)
  })).optional(),
  origin: z.string().min(1),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
});

// 4. Shipping
const shippingSchema = z.object({
  physicalProperties: z.object({
    weight: z.number().optional(),
    weightUnit: z.enum(["kg", "g", "lb"]).optional(),
    dimensions: z.object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.enum(["cm", "inch"]).optional()
    }).optional(),
  }),
  shippingMethods: z.array(z.object({
    method: z.enum(["standard", "express", "overnight", "international"]),
    cost: z.number().min(0),
    freeThreshold: z.number().min(0).optional(),
    estimatedDays: z.object({
      min: z.number().min(1),
      max: z.number().min(1)
    }),
    availableCountries: z.array(z.string()).optional(),
    carrier: z.string().optional(),
    isActive: z.boolean().default(true)
  })).optional(),
  delivery: deliveryOptionsSchema,
  packagingType: z.string(),
  shippingClass: z.string()
});

// 5. Warranty
const warrantySchema = z.object({
  warranty: z.object({
    hasWarranty: z.boolean().default(false),
    type: z.enum(["seller", "manufacturer", "brand"]).default("seller"),
    duration: z.number().min(0).optional(),
    periodUnit: z.enum(["days", "months", "years"]).default("months"),
    details: z.string().optional(),
    serviceCenters: z.array(z.string()).optional(),
    termsConditions: z.string().optional()
  }).optional(),
  returnPolicy: z.object({
    allowed: z.boolean().default(true),
    period: z.number().min(0).default(7),
    conditions: z.array(z.string()).optional(),
    refundMethods: z.array(z.enum(["wallet", "original_payment", "bank_transfer"])).optional(),
    returnShipping: z.enum(["seller_paid", "buyer_paid"]).default("buyer_paid")
  }).optional()
});


// 6. Main Product Payload Schema Definition (Inner)
const productBodySchema = z.object({
  // Core
  name: z.string().trim().min(1).max(100),
  nameBangla: z.string().trim().optional(),
  slug: z.string().trim().min(1).optional(), // Can be autogenerated
  sku: z.string().trim().optional(), // Autogenerated
  unit: objectIdSchema.optional(),

  businessUnit: z.string().min(1),
  categories: z.array(objectIdSchema).min(1),
  primaryCategory: objectIdSchema.optional(),
  subCategory: objectIdSchema.optional(),
  childCategory: objectIdSchema.optional(),
  brands: z.array(objectIdSchema).optional(),

  tags: z.array(z.string()).optional(),
  tagsBangla: z.array(z.string()).optional(),

  // Sub-modules (Nested Objects)
  pricing: pricingSchema,
  inventory: inventorySchema,
  details: detailsSchema,
  shipping: shippingSchema,
  warranty: warrantySchema,

  marketing: z.object({
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isTrending: z.boolean().default(false),
    seo: seoSchema,
  }).optional(),

  statusInfo: z.object({
    status: z.enum(["draft", "under_review", "published", "rejected", "archived", "suspended"]).default("draft")
  }).optional(),

  compliance: z.object({
    hasCertification: z.boolean().default(false),
    certifications: z.array(z.string()).optional(),
    importRestrictions: z.array(z.string()).optional(),
    safetyStandards: z.array(z.string()).optional()
  }).optional(),

  // Other flags
  variantTemplate: objectIdSchema.optional(),
  hasVariants: z.boolean().default(false),
  isBundle: z.boolean().default(false),
});

// Final Exported Schemas matching Middleware expectation { body: ... }
export const productZodSchema = z.object({
  body: productBodySchema
});

// For partial updates (PATCH requests)
// Explicitly partial the inner schema
export const productUpdateSchema = z.object({
  body: productBodySchema.partial()
});