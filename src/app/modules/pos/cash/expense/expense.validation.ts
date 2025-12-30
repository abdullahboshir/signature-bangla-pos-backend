import { z } from "zod";

const createExpenseZodSchema = z.object({
    body: z.object({
        date: z.string().min(1, "Date is required"),
        amount: z.number().positive("Amount must be positive"),
        category: z.enum(["Rent", "Utilities", "Salaries", "Maintenance", "Supplies", "Other"]),
        paymentMethod: z.enum(['cash', 'bank', 'mobile_money', 'other']),
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
