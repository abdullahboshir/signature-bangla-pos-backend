import { z } from 'zod';

export const subcategoryZodSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be URL-friendly'),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Category is required'),
  description: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
});

// For partial updates (PATCH requests)
export const subcategoryUpdateSchema = subcategoryZodSchema.partial();