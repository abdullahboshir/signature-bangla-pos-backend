import { Schema } from "mongoose";

export const checkoutSettingsSchema = new Schema({
    guestCheckout: { type: Boolean, default: true },
    requireAccount: { type: Boolean, default: false },
    enableCoupons: { type: Boolean, default: true },
    enableGiftCards: { type: Boolean, default: true },
    minimumOrderAmount: { type: Number, min: 0 },
    termsAndConditions: { type: String, required: true },
    privacyPolicy: { type: String, required: true }
}, { _id: false });
