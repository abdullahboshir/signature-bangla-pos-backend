import { z } from "zod";

export const categoryZodSchema = z.object({
  name: z.string().trim().min(1).max(50),
  businessUnit: z.string().min(1, "Business Unit is required"),
  description: z.string().trim().max(200).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryZodSchema.partial();
