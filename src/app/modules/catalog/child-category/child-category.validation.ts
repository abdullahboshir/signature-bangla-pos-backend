import { z } from "zod";

export const childCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(50),
    slug: z.string().optional(),
    businessUnit: z.string().min(1, "Category is required"),
    subCategory: z.string().min(1, "Category is required"),
    description: z.string().max(200).optional(),
    isActive: z.boolean().default(true),
  })
});

// For partial updates (PATCH requests)
export const childcategoryUpdateSchema = childCategoryZodSchema.partial();
