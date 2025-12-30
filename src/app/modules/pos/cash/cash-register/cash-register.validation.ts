import { z } from "zod";

const openRegisterZodSchema = z.object({
    body: z.object({
        outletId: z.string().min(1, "Outlet ID is required"),
        openingBalance: z.number().min(0, "Opening balance must be non-negative"),
        remarks: z.string().optional(),
        // businessUnit is usually inferred or passed, but we'll validate if provided
        businessUnit: z.string().optional(),
    }),
});

const closeRegisterZodSchema = z.object({
    body: z.object({
        closingBalance: z.number().min(0, "Closing balance must be non-negative"),
        remarks: z.string().optional(),
    }),
});

export const CashRegisterValidation = {
    openRegisterZodSchema,
    closeRegisterZodSchema,
};
