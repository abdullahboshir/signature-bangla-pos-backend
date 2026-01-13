
import { Schema, model } from 'mongoose';
import type { ILicense, LicenseModel } from './license.interface.ts';
import { type IModuleConfig } from '../package/package.interface.ts';

const moduleConfigSchema = new Schema<IModuleConfig>({
    enabled: { type: Boolean, default: false },
    limits: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const licenseSchema = new Schema<ILicense, LicenseModel>({
    clientId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    clientName: { type: String },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    totalPrice: { type: Number, default: 0 },
    priceBreakdown: {
        basePrice: { type: Number, default: 0 },
        modulePrices: [{
            module: { type: String },
            price: { type: Number }
        }]
    },
    overriddenLimits: {
        maxUsers: { type: Number },
        maxBusinessUnits: { type: Number },
        maxOutlets: { type: Number },
        maxStorage: { type: Number },
        maxProducts: { type: Number },
        maxOrders: { type: Number }
    },
    key: { type: String, required: true, unique: true },
    expiresAt: { type: Date },
    nextBillingDate: { type: Date },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'] },

    // Add-on modules enabled specifically for this license (overrides package defaults)
    customModules: {
        pos: { type: moduleConfigSchema },
        erp: { type: moduleConfigSchema },
        hrm: { type: moduleConfigSchema },
        ecommerce: { type: moduleConfigSchema },
        crm: { type: moduleConfigSchema },
        logistics: { type: moduleConfigSchema },
        accounting: { type: moduleConfigSchema },
        reports: { type: moduleConfigSchema },
        api_access: { type: moduleConfigSchema }
    },

    status: { type: String, enum: ['active', 'expired', 'suspended', 'revoked'], default: 'active' },
    activationDate: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

export const License = model<ILicense, LicenseModel>('License', licenseSchema);
