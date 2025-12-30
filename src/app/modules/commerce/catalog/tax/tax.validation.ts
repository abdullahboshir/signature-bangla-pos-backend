import { z } from 'zod';

export const createTaxValidationSchema = z.object({
    body: z.object({
        name: z.string({
            message: 'Name is required',
        }).trim().min(1, { message: 'Name cannot be empty' }),
        rate: z.number({
            message: 'Rate is required',
        }).min(0, { message: 'Rate must be a non-negative number' }),
        type: z.enum(['percentage', 'fixed']).optional(),
        businessUnit: z.string().nullable().optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateTaxValidationSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).optional(),
        rate: z.number().min(0).optional(),
        type: z.enum(['percentage', 'fixed']).optional(),
        businessUnit: z.string().nullable().optional(),
        isDefault: z.boolean().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const TaxValidations = {
    createTaxValidationSchema,
    updateTaxValidationSchema,
};
