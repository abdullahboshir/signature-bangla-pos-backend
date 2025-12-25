import { z } from "zod";

const createExpenseZodSchema = z.object({
    body: z.object({
        date: z.string({
            required_error: "Date is required",
        }),
        amount: z.number({
            required_error: "Amount is required",
        }).positive("Amount must be positive"),
        category: z.string({
            required_error: "Category is required",
        }),
        paymentMethod: z.enum(['cash', 'bank', 'mobile_money', 'other'], {
            required_error: "Payment method is required",
        }),
        reference: z.string().optional(),
        remarks: z.string().optional(),
        businessUnit: z.string().optional(),
        outlet: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }),
});

const updateExpenseZodSchema = z.object({
    body: z.object({
        date: z.string().optional(),
        amount: z.number().positive().optional(),
        category: z.string().optional(),
        paymentMethod: z.enum(['cash', 'bank', 'mobile_money', 'other']).optional(),
        reference: z.string().optional(),
        remarks: z.string().optional(),
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }),
});

export const ExpenseValidation = {
    createExpenseZodSchema,
    updateExpenseZodSchema,
};
