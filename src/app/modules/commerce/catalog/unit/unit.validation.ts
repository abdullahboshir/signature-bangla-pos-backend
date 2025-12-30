import { z } from 'zod';

const createUnitValidationSchema = z.object({
    body: z.object({
        name: z.string({
            message: 'Name is required',
        }),
        symbol: z.string({
            message: 'Symbol is required',
        }),
        status: z.enum(['active', 'inactive']).optional(),
        businessUnit: z.string().nullable().optional(), // Can be optionally passed or inferred from user context
        relatedBusinessTypes: z.array(z.string()).optional(),
    }),
});

const updateUnitValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        symbol: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
        businessUnit: z.string().optional(),
        relatedBusinessTypes: z.array(z.string()).optional(),
    }),
});

export const UnitValidations = {
    createUnitValidationSchema,
    updateUnitValidationSchema,
};
