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
