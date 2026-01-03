import { Schema, model } from 'mongoose';
import type { IPackage, PackageModel } from './package.interface.ts';

const packageSchema = new Schema<IPackage, PackageModel>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    features: [{ type: String }],
    limits: {
        maxUsers: { type: Number, default: 5 },
        maxOutlets: { type: Number, default: 1 },
        maxStorage: { type: Number, default: 512 }
    },
    moduleAccess: {
        pos: { type: Boolean, default: true },
        erp: { type: Boolean, default: false },
        hrm: { type: Boolean, default: false },
        ecommerce: { type: Boolean, default: false },
        crm: { type: Boolean, default: false },
        logistics: { type: Boolean, default: false }
    },
    supportType: { type: String, enum: ['basic', 'priority', 'dedicated'], default: 'basic' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
