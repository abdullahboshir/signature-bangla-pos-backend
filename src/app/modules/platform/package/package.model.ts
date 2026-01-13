
import { Schema, model } from 'mongoose';
import type { IPackage, PackageModel, IModuleConfig } from './package.interface.ts';

const moduleConfigSchema = new Schema<IModuleConfig>({
    enabled: { type: Boolean, default: false },
    monthlyPrice: { type: Number, default: 0 },
    limits: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const packageSchema = new Schema<IPackage, PackageModel>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    appliesTo: { type: String, enum: ['company', 'business-unit'], default: 'company' },

    trialPeriodDays: { type: Number, default: 0 },

    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], required: true },
    sortOrder: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
    isRecommended: { type: Boolean, default: false },
    highlightText: { type: String },
    shortDescription: { type: String },
    recommendedFor: { type: String },
    icon: { type: String, default: 'Package' },
    headerColor: { type: String },
    tags: [{ type: String }],
    features: [{ type: String }],
    limits: {
        maxUsers: { type: Number, default: 5 }, // -1 for unlimited
        maxBusinessUnits: { type: Number, default: 1 },
        maxOutlets: { type: Number, default: 1 },
        maxStorage: { type: Number, default: 512 },
        maxProducts: { type: Number, default: 100 },
        maxOrders: { type: Number, default: 1000 }
    },

    moduleAccess: {
        pos: { type: moduleConfigSchema, default: () => ({ enabled: true }) },
        erp: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        hrm: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        ecommerce: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        crm: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        logistics: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        accounting: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        reports: { type: moduleConfigSchema, default: () => ({ enabled: false }) },
        api_access: { type: moduleConfigSchema, default: () => ({ enabled: false }) }
    },

    supportType: { type: String, enum: ['basic', 'priority', 'dedicated'], default: 'basic' },
    isActive: { type: Boolean, default: true },
    isHidden: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },

    // --- Advanced Industrial Standard Fields ---
    setupFee: { type: Number, default: 0 },
    supportTicketPriority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    isDefaultPlan: { type: Boolean, default: false },
    allowCustomOverride: { type: Boolean, default: true },
    supportChannels: [{ type: String }],
    gracePeriodDays: { type: Number, default: 7 },

    // --- Legal & Security ---
    tosUrl: { type: String },
    privacyPolicyUrl: { type: String },
    maxConcurrentLogins: { type: Number, default: 5 }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

export const Package = model<IPackage, PackageModel>('Package', packageSchema);
