import { Schema, model } from 'mongoose';
import type { ILicense, LicenseModel } from './license.interface.ts';

const licenseSchema = new Schema<ILicense, LicenseModel>({
    clientId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    clientName: { type: String },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    key: { type: String, required: true, unique: true },
    expiresAt: { type: Date },

    // Add-on modules enabled specifically for this license (overrides package defaults)
    customModules: {
        pos: { type: Boolean },
        erp: { type: Boolean },
        hrm: { type: Boolean },
        ecommerce: { type: Boolean },
        crm: { type: Boolean },
        logistics: { type: Boolean }
    },

    status: { type: String, enum: ['active', 'expired', 'revoked'], default: 'active' },
    activationDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export const License = model<ILicense, LicenseModel>('License', licenseSchema);
