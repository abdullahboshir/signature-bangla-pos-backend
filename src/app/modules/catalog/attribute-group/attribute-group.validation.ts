import { z } from 'zod';

const attributeFieldSchema = z.object({
    key: z.string({ message: 'Field key is required' }),
    label: z.string({ message: 'Field label is required' }),
    type: z.enum(['text', 'number', 'date', 'select', 'boolean', 'textarea']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
});

export const createAttributeGroupValidationSchema = z.object({
    body: z.object({
        name: z.string({
            message: 'Name is required',
        }).trim().min(1, { message: 'Name cannot be empty' }),
        code: z.string({
            message: 'Code is required',
        }).trim().min(1, { message: 'Code cannot be empty' }),
        description: z.string().optional(),
        availableModules: z.array(z.enum(['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'marketing', 'integrations', 'system']))
            .min(1, { message: 'At least one module must be selected' }),
        fields: z.array(attributeFieldSchema).optional(),
        sortOrder: z.number().default(0),
        businessUnit: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const updateAttributeGroupValidationSchema = z.object({
    body: z.object({
        name: z.string().trim().min(1).optional(),
        code: z.string().trim().min(1).optional(),
        description: z.string().optional(),
        availableModules: z.array(z.enum(['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'marketing', 'integrations', 'system'])).optional(),
        fields: z.array(attributeFieldSchema).optional(),
        sortOrder: z.number().optional(),
        businessUnit: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
    }),
});

export const AttributeGroupValidations = {
    createAttributeGroupValidationSchema,
    updateAttributeGroupValidationSchema,
};
