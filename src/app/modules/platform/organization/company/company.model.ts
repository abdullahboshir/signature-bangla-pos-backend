import { Schema, model } from 'mongoose';
import type { ICompanyDocument, ICompanyModel } from './company.interface.js';
import { brandingSchema, contactSchema, locationSchema } from '../shared/common.schema.js';

const companySchema = new Schema<ICompanyDocument, ICompanyModel>(
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
        // Company-level Module Override (Optional)
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
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
    }
);

// Virtual for business units
companySchema.virtual('businessUnits', {
    ref: 'BusinessUnit',
    localField: '_id',
    foreignField: 'company'
});

// Virtual for company settings
companySchema.virtual('settings', {
    ref: 'CompanySettings',
    localField: '_id',
    foreignField: 'company',
    justOne: true
});

companySchema.index({ isActive: 1 });
companySchema.index({ slug: 1 });
companySchema.index({ "contact.email": 1 });
companySchema.virtual('businessUnits', {
    ref: 'BusinessUnit',
    localField: '_id',
    foreignField: 'company'
});

export const Company = model<ICompanyDocument, ICompanyModel>('Company', companySchema);
