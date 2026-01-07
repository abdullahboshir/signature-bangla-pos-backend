import { Types } from "mongoose";

export const SYSTEM_USER_ID = new Types.ObjectId(
    process.env["system_user_id"] || "66f000000000000000000000"
);

export const DEFAULT_LIMITS = {
    financial: {
        maxDiscountPercent: 0,
        maxDiscountAmount: 0,
        maxRefundAmount: 0,
        maxCreditLimit: 0,
        maxCashTransaction: 0
    },
    dataAccess: {
        maxProducts: 0,
        maxOrders: 0,
        maxCustomers: 0,
        maxOutlets: 0,
        maxWarehouses: 0
    },
    security: {
        maxLoginSessions: 1,
        ipWhitelistEnabled: false,
        loginTimeRestricted: false
    },
    approval: {
        maxPurchaseOrderAmount: 0,
        maxExpenseEntry: 0
    }
};
