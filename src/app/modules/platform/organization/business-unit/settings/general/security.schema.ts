import { Schema } from "mongoose";

export const securitySettingsSchema = new Schema({
    enableHttps: { type: Boolean, default: true },
    enableCaptcha: { type: Boolean, default: false },
    blockFailedLogins: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 60, min: 5 },
    ipBlacklist: [{ type: String }]
}, { _id: false });
