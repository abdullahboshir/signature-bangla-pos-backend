import { Schema, model } from 'mongoose';
import type { IOrganizationDocument, IOrganizationModel } from './organization.interface.js';
import { brandingSchema, contactSchema, locationSchema } from './shared/common.schema.js';

const organizationSchema = new Schema<IOrganizationDocument, IOrganizationModel>(
    {
        branding: { type: brandingSchema, required: true },
        name: { type: String, required: true, trim: true, index: true },
        slug: { type: String, required: true, trim: true, index: true, unique: true },
        contact: { type: contactSchema, required: true },
        location: { type: locationSchema, required: true },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
        },
        // ====== BUSINESS DETAILS ======
        businessType: {
            type: String,
            enum: ['proprietorship', 'partnership', 'private_limited', 'public_limited', 'ngo', 'cooperative'],
            required: true,
        },
        establishedDate: {
            type: Date,
        },
        numberOfEmployees: {
            type: Number,
            default: 0,
        },

        // ====== LEGAL REPRESENTATIVE ======
        legalRepresentative: {
            name: { type: String, trim: true },
            designation: { type: String, trim: true },
            contactPhone: { type: String, trim: true },
            email: { type: String, trim: true, lowercase: true },
            nationalId: { type: String, trim: true },
        },

        // ====== AUTHORIZED CAPITAL ======
        capital: {
            authorizedCapital: { type: Number },
            paidUpCapital: { type: Number },
            shareCapital: { type: Number },
            currency: { type: String, default: "BDT" }
        },
        // Ownership & Governance
        shareholders: [{
            name: { type: String, required: true },
            sharePercentage: { type: Number, required: true },
            nidOrPassport: { type: String }
        }],
        directors: [{
            name: { type: String, required: true },
            designation: { type: String, required: true },
            nidOrPassport: { type: String },
            isManagingDirector: { type: Boolean, default: false }
        }],
        isActive: {
            type: Boolean,
            default: true
        },
        // Organization-level Module Override (Optional)
        activeModules: {
            pos: { type: Boolean, default: true },
            erp: { type: Boolean, default: true },
            hrm: { type: Boolean, default: false },
            ecommerce: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            logistics: { type: Boolean, default: false },
            governance: { type: Boolean, default: true }, // Shareholders, Voting, Meetings, Compliance
            finance: { type: Boolean, default: true },
            marketing: { type: Boolean, default: false },
            integrations: { type: Boolean, default: false },
            saas: { type: Boolean, default: true } // Access to billing/subscription UI
        },

        // ====== TENANT CONFIGURATION (Hybrid Multi-Tenancy) ======
        tenantConfig: {
            deploymentType: {
                type: String,
                enum: ['shared', 'dedicated'],
                default: 'shared'
            },
            customDomain: { type: String, trim: true, sparse: true },
            databaseUri: { type: String, select: false }, // Sensitive - excluded by default
            storageConfig: {
                provider: { type: String, enum: ['cloudinary', 's3', 'local'] },
                bucket: { type: String },
                region: { type: String }
            },
            isProvisioned: { type: Boolean, default: false },
            provisionedAt: { type: Date }
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Virtual for business units
organizationSchema.virtual('businessUnits', {
    ref: 'BusinessUnit',
    localField: '_id',
    foreignField: 'organization'
});

// Virtual for organization settings
organizationSchema.virtual('settings', {
    ref: 'OrganizationSettings',
    localField: '_id',
    foreignField: 'organization',
    justOne: true
});

organizationSchema.index({ isActive: 1 });
organizationSchema.index({ slug: 1 });
organizationSchema.index({ "contact.email": 1 });

// ====== TENANT RESOLUTION INDEXES (Critical for Performance) ======
organizationSchema.index({ 'tenantConfig.customDomain': 1 }, { sparse: true, unique: true });
organizationSchema.index({ 'tenantConfig.deploymentType': 1 });
organizationSchema.index({ isActive: 1, 'tenantConfig.deploymentType': 1 }); // Compound for filtered queries

export const Organization = model<IOrganizationDocument, IOrganizationModel>('Organization', organizationSchema);
