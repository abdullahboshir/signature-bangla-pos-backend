import { z } from "zod";

export const categoryZodSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(50),
    slug: z.string().optional(),
    businessUnit: z.string().optional(),
    description: z.string().trim().max(200).optional(),
    image: z.string().optional(),
    isActive: z.preprocess((val) => {
      if (typeof val === 'string') return val === 'true';
      return val;
    }, z.boolean().default(true)),
  })
});

export const categoryUpdateSchema = categoryZodSchema.partial();
