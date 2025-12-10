import { z } from 'zod';

export const createCompanySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Company name is required'),
        registrationNumber: z.string().min(1, 'Registration number is required'),
        address: z.string().min(1, 'Address is required'),
        contactEmail: z.string().email('Invalid email address'),
        contactPhone: z.string().min(1, 'Contact phone is required'),
        logo: z.string().optional(),
        website: z.string().url('Invalid URL').optional(),
    }),
});

export const updateCompanySchema = z.object({
    body: z.object({
        name: z.string().optional(),
        registrationNumber: z.string().optional(),
        address: z.string().optional(),
        contactEmail: z.string().email('Invalid email address').optional(),
        contactPhone: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().url('Invalid URL').optional(),
        isActive: z.boolean().optional(),
    }),
});
