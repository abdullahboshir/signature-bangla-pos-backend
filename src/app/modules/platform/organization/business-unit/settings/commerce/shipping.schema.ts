import { Schema } from "mongoose";

export const shippingSettingsSchema = new Schema({
    enabled: { type: Boolean, default: true },
    calculation: {
        type: String,
        enum: ["flat", "weight", "price", "free"],
        default: "flat"
    },
    defaultRate: { type: Number, default: 0, min: 0 },
    freeShippingEnabled: { type: Boolean, default: false },
    freeShippingMinimum: { type: Number, min: 0 },
    handlingFee: { type: Number, default: 0, min: 0 },
    processingTime: { type: Number, default: 2, min: 1, max: 30 },
    shippingZones: [{
        name: { type: String, required: true },
        countries: [{ type: String, required: true }],
        regions: [{ type: String }],
        rates: [{
            minWeight: { type: Number, min: 0 },
            maxWeight: { type: Number, min: 0 },
            minPrice: { type: Number, min: 0 },
            maxPrice: { type: Number, min: 0 },
            cost: { type: Number, required: true, min: 0 }
        }]
    }]
}, { _id: false });
