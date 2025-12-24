
import { z } from 'zod';

const purchaseItemSchema = z.object({
    product: z.string(),
    quantity: z.number().min(1),
    unitCost: z.number().min(0),
    total: z.number().min(0),
});

export const createPurchaseZodSchema = z.object({
    body: z.object({
        supplier: z.string(),
        purchaseDate: z.string().or(z.date()),
        dueDate: z.string().or(z.date()).optional(),
        referenceNo: z.string().optional(),
        businessUnit: z.string(),
        outlet: z.string(),
        status: z.enum(['pending', 'ordered', 'received']).default('pending'),
        items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
        subTotal: z.number(),
        tax: z.number().optional().default(0),
        shippingCost: z.number().optional().default(0),
        discount: z.number().optional().default(0),
        grandTotal: z.number(),
        paidAmount: z.number().optional().default(0),
        dueAmount: z.number().optional().default(0),
        paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'mobile_banking', 'cheque', 'credit']).optional(),
        paymentStatus: z.enum(['pending', 'partial', 'paid']).default('pending'),
        notes: z.string().optional(),
        attachment: z.string().optional(),
    })
});

export const updatePurchaseZodSchema = z.object({
    body: z.object({
        supplier: z.string().optional(),
        purchaseDate: z.string().or(z.date()).optional(),
        dueDate: z.string().or(z.date()).optional(),
        referenceNo: z.string().optional(),
        businessUnit: z.string().optional(),
        outlet: z.string().optional(),
        status: z.enum(['pending', 'ordered', 'received']).optional(),
        items: z.array(purchaseItemSchema).optional(),
        subTotal: z.number().optional(),
        tax: z.number().optional(),
        shippingCost: z.number().optional(),
        discount: z.number().optional(),
        grandTotal: z.number().optional(),
        paidAmount: z.number().optional(),
        dueAmount: z.number().optional(),
        paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'mobile_banking', 'cheque', 'credit']).optional(),
        paymentStatus: z.enum(['pending', 'partial', 'paid']).optional(),
        notes: z.string().optional(),
        attachment: z.string().optional(),
    })
});
