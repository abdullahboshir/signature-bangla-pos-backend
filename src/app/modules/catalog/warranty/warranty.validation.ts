import { z } from "zod";

const createWarranty = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    duration: z.number().min(0, "Duration must be at least 0"),
    periodUnit: z.enum(["days", "weeks", "months", "years"]),
    type: z.enum(["seller", "manufacturer", "brand"]),
    description: z.string().optional(),
    termsConditions: z.string().optional(),
    availableModules: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    businessUnit: z.string().optional().nullable(),
  })
});

const updateWarranty = z.object({
  body: z.object({
    name: z.string().optional(),
    duration: z.number().optional(),
    periodUnit: z.enum(["days", "weeks", "months", "years"]).optional(),
    type: z.enum(["seller", "manufacturer", "brand"]).optional(),
    description: z.string().optional(),
    termsConditions: z.string().optional(),
    availableModules: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    businessUnit: z.string().optional().nullable(),
  })
});

export const WarrantyValidation = {
  createWarranty,
  updateWarranty,
};
