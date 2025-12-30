import { z } from "zod";

const createExpenseCategoryZodSchema = z.object({
    body: z.object({
        name: z.string().min(1, { message: "Category name is required" }),
        type: z.enum(["fixed", "variable"]).optional(),
        businessUnit: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

const updateExpenseCategoryZodSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        type: z.enum(["fixed", "variable"]).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const ExpenseCategoryValidation = {
    createExpenseCategoryZodSchema,
    updateExpenseCategoryZodSchema,
};
