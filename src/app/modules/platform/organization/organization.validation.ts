import { z } from 'zod';

export const createOrganizationSchema = z.object({
    body: z.object({
        branding: z.object({
            name: z.string().min(1, 'Organization name is required'),
        }),
        contact: z.object({
            email: z.string().email('Invalid email address'),
            phone: z.string().min(1, 'Contact phone is required'),
        }),
        location: z.object({
            address: z.string().min(1, 'Address is required'),
            city: z.string().optional(),
            country: z.string().default("Bangladesh"),
            timezone: z.string().default("Asia/Dhaka"),
        }),
        registrationNumber: z.string().min(1, 'Registration number is required'),
        businessType: z.enum(['proprietorship', 'partnership', 'private_limited', 'public_limited', 'ngo', 'cooperative']).default('proprietorship'),
        legalRepresentative: z.object({
            name: z.string().min(1, 'Owner name is required'),
            contactPhone: z.string().optional(),
            nationalId: z.string().optional(),
        }),
        activeModules: z.object({
            pos: z.boolean().optional(),
            erp: z.boolean().optional(),
            hrm: z.boolean().optional(),
            ecommerce: z.boolean().optional(),
            crm: z.boolean().optional(),
            logistics: z.boolean().optional(),
            finance: z.boolean().optional(),
            marketing: z.boolean().optional(),
            integrations: z.boolean().optional(),
            governance: z.boolean().optional(),
            saas: z.boolean().optional(),
        }).optional(),
    }),
});

export const updateOrganizationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        registrationNumber: z.string().optional(),
        address: z.string().optional(),
        contactEmail: z.string().email('Invalid email address').optional(),
        contactPhone: z.string().optional(),
        logo: z.string().optional(),
        website: z.string().url('Invalid URL').optional(),
        isActive: z.boolean().optional(),
        tenantConfig: z.object({
            deploymentType: z.enum(['shared', 'dedicated']).optional(),
            customDomain: z.string().optional(),
            databaseUri: z.string().optional(),
            storageConfig: z.object({
                provider: z.enum(['cloudinary', 's3', 'local']).optional(),
                cloudName: z.string().optional(),
                apiKey: z.string().optional(),
                apiSecret: z.string().optional(),
                bucket: z.string().optional(),
                region: z.string().optional(),
                accessKeyId: z.string().optional(),
                secretAccessKey: z.string().optional(),
                cdnUrl: z.string().optional(),
                basePath: z.string().optional(),
            }).optional(),
            isProvisioned: z.boolean().optional(),
        }).optional(),
    }),
});
