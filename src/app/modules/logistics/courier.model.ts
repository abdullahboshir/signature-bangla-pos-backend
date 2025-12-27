import { Schema, model } from "mongoose";

export interface ICourier {
    name: string; // "Steadfast", "Pathao", "RedX"
    providerId: string; // unique slug e.g "steadfast"
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    isActive: boolean;
    businessUnit: Schema.Types.ObjectId;
    config: Map<string, any>; // Extra config like "store_id"
}

const courierSchema = new Schema<ICourier>({
    name: { type: String, required: true },
    providerId: { type: String, required: true },
    apiKey: { type: String, select: false }, // Hide by default
    apiSecret: { type: String, select: false },
    baseUrl: { type: String },
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: "BusinessUnit", required: true },
    config: { type: Map, of: Schema.Types.Mixed }
}, {
    timestamps: true
});

courierSchema.index({ providerId: 1, businessUnit: 1 }, { unique: true });
courierSchema.index({ businessUnit: 1 });
courierSchema.index({ isActive: 1 });

export const Courier = model<ICourier>("Courier", courierSchema);
