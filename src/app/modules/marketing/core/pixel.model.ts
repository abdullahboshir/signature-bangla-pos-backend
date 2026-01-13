import { Schema, model } from 'mongoose';
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IPixel {
    name: string;
    pixelId: string;
    accessToken?: string; // Encrypted ideally, but keeping simple for now
    isActive: boolean;
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
    description?: string;
}

const pixelSchema = new Schema<IPixel>({
    name: { type: String, required: true },
    pixelId: { type: String, required: true },
    accessToken: { type: String, select: false }, // Hide by default
    isActive: { type: Boolean, default: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    description: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});

// Compound unique index to prevent duplicate pixels for same BU (optional) or just unique pixelId globally?
// A pixel ID is unique to Meta, so globally unique makes sense.
pixelSchema.index({ pixelId: 1 }, { unique: true });

export const Pixel = model<IPixel>('Pixel', pixelSchema);

// Apply Context-Aware Data Isolation
pixelSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
