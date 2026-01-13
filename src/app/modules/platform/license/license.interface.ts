
import { Model, Types } from 'mongoose';
import type { IModuleConfig, IPackageLimit } from '../package/package.interface.ts';

export type ILicenseStatus = 'active' | 'expired' | 'suspended' | 'revoked';

export interface ILicense {
    clientId: Types.ObjectId;
    clientName?: string; // Cache for display
    packageId: Types.ObjectId;
    key: string;
    expiresAt?: Date; // Null for lifetime
    nextBillingDate?: Date | undefined; // [NEW] Unified billing renewal date
    billingCycle?: 'monthly' | 'yearly' | 'lifetime'; // [NEW] Current cycle for alignment
    totalPrice?: number; // Calculated price for this subscription
    priceBreakdown?: {
        basePrice: number;
        modulePrices: Array<{ module: string; price: number }>;
    };
    overriddenLimits?: IPackageLimit; // [NEW] Manual overrides for this specific license
    customModules?: {
        pos?: IModuleConfig;
        erp?: IModuleConfig;
        hrm?: IModuleConfig;
        ecommerce?: IModuleConfig;
        crm?: IModuleConfig;
        logistics?: IModuleConfig;
        accounting?: IModuleConfig;
        reports?: IModuleConfig;
        api_access?: IModuleConfig;
    };
    status: ILicenseStatus;
    activationDate: Date;
    createdBy: Types.ObjectId; // Admin who created it
}

export type LicenseModel = Model<ILicense>;
