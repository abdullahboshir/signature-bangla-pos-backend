import { z } from "zod";

export const createBrandValidationSchema = z.object({
    body: z.object({
        name: z.string({
            message: "Brand Name is required",
        }),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        status: z.enum(["active", "inactive"]).optional(),
        businessUnit: z.string().nullable().optional(),
    }),
});

export const updateBrandValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().url().optional().or(z.literal("")),
        status: z.enum(["active", "inactive"]).optional(),
        businessUnit: z.string().nullable().optional(),
    }),
});

export const BrandValidations = {
    createBrandValidationSchema,
    updateBrandValidationSchema
}
