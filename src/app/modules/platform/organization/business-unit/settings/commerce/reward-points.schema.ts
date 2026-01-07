import { Schema } from "mongoose";

export const rewardPointsSettingsSchema = new Schema({
    enabled: { type: Boolean, default: false },
    pointsPerCurrency: { type: Number, default: 1 },
    currencyPerPoint: { type: Number, default: 0.01 },
    minimumRedemption: { type: Number, default: 100 },
    expiryPeriod: { type: Number, default: 12 }
}, { _id: false });
