import { Document, Model } from 'mongoose';
import type { ICompanyDocument } from '../company.interface.ts';

/**
 * Company-specific configuration.
 * Separated from Global System Settings to allow multi-tenant customization.
 */
export interface ICompanySettings extends Document {
    company: ICompanyDocument['_id']; // Reference to the company
    branding: {
        logoUrl?: string;
        faviconUrl?: string;
        primaryColor?: string;
    };
    invoice: {
        prefix: string; // e.g., INV-
        footerText?: string;
    };
    tax: {
        vatNumber?: string;
        isVatEnabled: boolean;
    };
    localization: {
        currency: string;
        timezone: string;
    };
}

export type ICompanySettingsModel = Model<ICompanySettings>;
