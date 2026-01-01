import { z } from 'zod';
import mongoose from 'mongoose';
import { BUSINESS_MODEL, BUSINESS_INDUSTRY } from './business-unit.constant.ts';

// Helper validations
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid ObjectId",
});

const urlSchema = z.string().url().optional().or(z.literal(''));

// Main BusinessUnit validation schema
export const createBusinessUnitValidationSchema = z.object({
  vendor: objectIdSchema,

  branding: z.object({
    name: z.string().min(1, "BusinessUnit name is required").max(100, "BusinessUnit name too long"),
    description: z.string().max(500, "Description too long").optional(),
    descriptionBangla: z.string().max(500, "Description too long").optional(),
    logo: urlSchema,
    banner: urlSchema,
    favicon: urlSchema,
    theme: z.object({
      primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional(),
      secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional(),
      accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional(),
      fontFamily: z.string().max(50, "Font family too long").optional(),
    }).optional(),
  }),

  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers, and hyphens"),

  categories: z.array(objectIdSchema).min(1, "At least one category is required").optional(),
  primaryCategory: objectIdSchema.optional(),
  tags: z.array(z.string().max(30, "Tag too long")).optional(),
  specialties: z.array(z.string().max(50, "Specialty too long")).optional(),
  operationalModel: z.enum(Object.values(BUSINESS_MODEL) as [string, ...string[]]).optional().default(BUSINESS_MODEL.RETAIL),
  industry: z.enum(Object.values(BUSINESS_INDUSTRY) as [string, ...string[]]).optional().default(BUSINESS_INDUSTRY.GENERAL),
  attributeGroup: objectIdSchema.optional(),

  contact: z.object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5, "Phone number is required").max(20, "Phone number too long"),
    supportHours: z.string().max(50, "Support hours too long").optional(),
    supportPhone: z.string().max(20, "Support phone too long").optional(),
    socialMedia: z.object({
      facebook: urlSchema,
      instagram: urlSchema,
      twitter: urlSchema,
      youtube: urlSchema,
      linkedin: urlSchema,
    }).optional(),
  }),

  location: z.object({
    address: z.string().min(5, "Address is required").max(200, "Address too long"),
    city: z.string().min(1, "City is required").max(50, "City name too long"),
    state: z.string().min(1, "State is required").max(50, "State name too long"),
    country: z.string().min(1, "Country is required").max(50, "Country name too long"),
    postalCode: z.string().min(1, "Postal code is required").max(20, "Postal code too long"),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }).optional(),
    timezone: z.string().optional(),
  }),

  multipleLocations: z.array(z.object({
    address: z.string().max(200, "Address too long").optional(),
    city: z.string().max(50, "City name too long").optional(),
    state: z.string().max(50, "State name too long").optional(),
    country: z.string().max(50, "Country name too long").optional(),
    postalCode: z.string().max(20, "Postal code too long").optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }).optional(),
  })).optional(),

  settings: z.object({
    currency: z.enum(["BDT", "USD"]).optional(),
    language: z.enum(["en", "bn"]).optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().max(20, "Date format too long").optional(),
    weightUnit: z.enum(["kg", "g", "lb"]).optional(),
    dimensionUnit: z.enum(["cm", "inch"]).optional(),
    inventoryManagement: z.boolean().optional(),
    lowStockAlert: z.boolean().optional(),
  }).optional(),

  policies: z.object({
    returnPolicy: z.string().max(1000, "Return policy too long").optional(),
    shippingPolicy: z.string().max(1000, "Shipping policy too long").optional(),
    privacyPolicy: z.string().max(1000, "Privacy policy too long").optional(),
    termsOfService: z.string().max(1000, "Terms of service too long").optional(),
    warrantyPolicy: z.string().max(1000, "Warranty policy too long").optional(),
    refundPolicy: z.string().max(1000, "Refund policy too long").optional(),
  }),

  seo: z.object({
    metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
    metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
    keywords: z.array(z.string().max(50, "Keyword too long")).optional(),
    canonicalUrl: urlSchema,
    ogImage: urlSchema,
    structuredData: z.object({}).optional(),
  }),

  features: z.object({
    hasInventory: z.boolean().optional(),
    hasVariants: z.boolean().optional(),
    hasAttributeGroups: z.boolean().optional(),
    hasShipping: z.boolean().optional(),
    hasSeo: z.boolean().optional(),
    hasCompliance: z.boolean().optional(),
    hasBundles: z.boolean().optional(),
    hasWarranty: z.boolean().optional(),
  }).optional(),

  // Optional fields with defaults
  status: z.enum(["draft", "under_review", "published", "suspended", "archived"]).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
  isFeatured: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  featuredExpiresAt: z.string().datetime().optional(),
}).refine((data) => {
  if (!data.primaryCategory) return true;
  if (!data.categories) return false;
  return data.categories.includes(data.primaryCategory);
}, {
  message: "Primary category must be one of the selected categories",
  path: ["primaryCategory"],
});

export const updateBusinessUnitSchema = createBusinessUnitValidationSchema.partial();

export type CreateBusinessUnitInput = z.infer<typeof createBusinessUnitValidationSchema>;
export type UpdateBusinessUnitInput = z.infer<typeof updateBusinessUnitSchema>;