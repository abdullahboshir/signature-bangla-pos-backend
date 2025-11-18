import { z } from 'zod';
import { isValidObjectId } from 'mongoose';

// Helper for ObjectId validation
const objectIdSchema = z.string().refine((val) => isValidObjectId(val), {
  message: 'Invalid ObjectId',
});

// Supplier Sub-Schema
const supplierSchema = z.object({
  supplier: objectIdSchema,
  supplyPrice: z.number().min(0),
  availableStock: z.number().min(0).optional(),
  leadTime: z.number().min(0).optional(), // in days
});

// Main Product Schema
export const productZodSchema = z.object({
  name: z.string().trim().min(1).max(100),
  sku: z.string().trim().min(1).toUpperCase(),
  category: objectIdSchema,
  subCategories: z.array(objectIdSchema).optional(),
  price: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  unit: z.enum(['kg', 'gram', 'piece', 'dozen', 'litre', 'ml']),
  stock: z.number().min(0),
  suppliers: z.array(supplierSchema).optional(),
  origin: z.string().trim().min(1),
  description: z.string().trim().max(1000).optional(),
  images: z.array(z.string().url()).min(1), // Ensure valid URLs
  isAvailable: z.boolean().default(true),
  discount: z.number().min(0).max(100).default(0),
  tags: z.array(z.string().trim()).default([]),
  ratings: z.number().min(0).max(5).default(0),
  reviewsCount: z.number().min(0).default(0),
  isOrganic: z.boolean().default(false),
  deliveryTime: z.string().trim().optional(),
  brand: objectIdSchema.optional(),
  weight: z.number().min(0).optional(),
  barcode: z.string().optional(),
});

// For partial updates (PATCH requests)
export const productUpdateSchema = productZodSchema.partial();