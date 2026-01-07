import { Schema } from "mongoose";

export const inventorySettingsSchema = new Schema({
    allowNegativeStock: { type: Boolean, default: false },
    enableLowStockAlerts: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
    barcodeFormat: { type: String, enum: ["EAN13", "UPCA", "CODE128"], default: "CODE128" }
}, { _id: false });
