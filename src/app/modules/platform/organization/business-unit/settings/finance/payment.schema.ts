import { Schema } from "mongoose";

export const paymentSettingsSchema = new Schema({
    acceptedMethods: [{
        type: String,
        enum: ["card", "cash", "bank", "mobile", "digital"]
    }],
    cashOnDelivery: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    mobileBanking: { type: Boolean, default: true },
    autoCapture: { type: Boolean, default: true },
    paymentInstructions: { type: String }
}, { _id: false });
