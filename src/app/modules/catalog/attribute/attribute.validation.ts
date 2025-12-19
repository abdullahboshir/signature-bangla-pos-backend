import { z } from "zod";

export const createAttributeZodSchema = z.object({
    body: z.object({
        name: z.string({
            message: "Attribute Name is required",
        }),
        values: z.array(z.string()).min(1, "At least one value is required"),
        businessUnit: z.string().optional(),
        status: z.enum(["active", "inactive"]).optional(),
    }),
});

export const updateAttributeZodSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        values: z.array(z.string()).optional(),
        status: z.enum(["active", "inactive"]).optional(),
    }),
});
