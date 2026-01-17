import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface ICourier {
    name: string; // "Steadfast", "Pathao", "RedX"
    providerId: string; // unique slug e.g "steadfast"
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    isActive: boolean;
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics';
    company: Schema.Types.ObjectId;
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
    // Typically 'logistics', but could be 'pos' for local delivery
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics'],
        default: 'logistics',
        required: true,
        index: true
    },
    businessUnit: { type: Schema.Types.ObjectId, ref: "BusinessUnit", required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    config: { type: Map, of: Schema.Types.Mixed }
}, {
    timestamps: true
});

courierSchema.index({ providerId: 1, businessUnit: 1 }, { unique: true });
courierSchema.index({ businessUnit: 1 });
courierSchema.index({ isActive: 1 });

export const Courier = model<ICourier>("Courier", courierSchema);

// Apply Context-Aware Data Isolation
courierSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
