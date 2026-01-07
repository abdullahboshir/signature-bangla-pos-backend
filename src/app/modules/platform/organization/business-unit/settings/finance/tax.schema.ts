import { Schema } from "mongoose";

export const taxSettingsSchema = new Schema({
    enabled: { type: Boolean, default: true },
    pricesIncludeTax: { type: Boolean, default: false },
    taxBasedOn: {
        type: String,
        enum: ["shipping", "billing", "businessUnit"],
        default: "businessUnit"
    },
    taxClasses: [{
        name: { type: String, required: true },
        rate: { type: Number, required: true, min: 0, max: 100 },
        countries: [{ type: String, required: true }],
        states: [{ type: String }]
    }]
}, { _id: false });
