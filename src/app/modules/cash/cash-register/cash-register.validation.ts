import { z } from "zod";

const openRegisterZodSchema = z.object({
    body: z.object({
        outlet: z.string({
            required_error: "Outlet ID is required",
        }),
        openingBalance: z.number({
            required_error: "Opening balance is required",
        }).min(0, "Opening balance must be non-negative"),
        remarks: z.string().optional(),
        // businessUnit is usually inferred or passed, but we'll validate if provided
        businessUnit: z.string().optional(),
    }),
});

const closeRegisterZodSchema = z.object({
    body: z.object({
        closingBalance: z.number({
            required_error: "Closing balance is required",
        }).min(0, "Closing balance must be non-negative"),
        remarks: z.string().optional(),
    }),
});

export const CashRegisterValidation = {
    openRegisterZodSchema,
    closeRegisterZodSchema,
};
