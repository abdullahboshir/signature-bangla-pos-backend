import { Schema, model } from 'mongoose';
import type { ICompanyDocument, ICompanyModel } from './company.interface.ts';

const companySchema = new Schema<ICompanyDocument, ICompanyModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        registrationNumber: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
        },
        contactPhone: {
            type: String,
            required: true,
        },
        logo: {
            type: String,
        },
        website: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Company-level Module Override (Optional)
        activeModules: {
            pos: { type: Boolean, default: true },
            erp: { type: Boolean, default: true },
            hrm: { type: Boolean, default: false },
            ecommerce: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            logistics: { type: Boolean, default: false },
            governance: { type: Boolean, default: false }, // Shareholders, Voting, Meetings, Compliance
            finance: { type: Boolean, default: false },
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

companySchema.index({ isActive: 1 });
companySchema.index({ contactEmail: 1 });
companySchema.virtual('businessUnits', {
    ref: 'BusinessUnit',
    localField: '_id',
    foreignField: 'company'
});

export const Company = model<ICompanyDocument, ICompanyModel>('Company', companySchema);
