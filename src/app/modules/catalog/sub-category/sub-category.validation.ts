import { z } from 'zod';

export const subcategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    slug: z.string().optional(),
    category: z.string().min(1, 'Category is required'),
    businessUnit: z.string().min(1, 'Business Unit is required'),
    description: z.string().max(200).optional(),
    isActive: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean().default(true)),
  })
});

// For partial updates (PATCH requests)
export const subcategoryUpdateSchema = subcategoryZodSchema.partial();