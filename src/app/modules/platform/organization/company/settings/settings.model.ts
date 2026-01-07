import { Schema, model } from 'mongoose';
import type { ICompanySettings, ICompanySettingsModel } from './settings.interface.ts';

const companySettingsSchema = new Schema<ICompanySettings>({
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        unique: true
    },
    branding: {
        logoUrl: { type: String },
        faviconUrl: { type: String },
        primaryColor: { type: String, default: '#000000' }
    },
    invoice: {
        prefix: { type: String, default: 'INV-' },
        footerText: { type: String }
    },
    tax: {
        vatNumber: { type: String },
        isVatEnabled: { type: Boolean, default: false }
    },
    localization: {
        currency: { type: String, default: 'BDT' },
        timezone: { type: String, default: 'Asia/Dhaka' }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (_doc, ret) {
            delete ret._id;
            delete ret.__v;
        }
    }
});

export const CompanySettings = model<ICompanySettings, ICompanySettingsModel>('CompanySettings', companySettingsSchema);
