import { Schema } from "mongoose";

export const prefixesSettingsSchema = new Schema({
    invoice: { type: String, default: "INV-" },
    order: { type: String, default: "ORD-" },
    purchase: { type: String, default: "PUR-" },
    sku: { type: String, default: "SKU-" }
}, { _id: false });
