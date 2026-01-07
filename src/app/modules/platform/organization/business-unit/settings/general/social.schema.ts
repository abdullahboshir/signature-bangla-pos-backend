import { Schema } from "mongoose";

export const socialSettingsSchema = new Schema({
    shareButtons: { type: Boolean, default: true },
    socialLogin: { type: Boolean, default: false },
    facebookAppId: { type: String },
    googleClientId: { type: String },
    socialProof: {
        showPurchaseNotifications: { type: Boolean, default: true },
        showReviewCount: { type: Boolean, default: true },
        showVisitorCount: { type: Boolean, default: false }
    }
}, { _id: false });
