import { Model, Types as _Types } from 'mongoose';

export type ISupportType = 'basic' | 'priority' | 'dedicated';
export type IBillingCycle = 'monthly' | 'yearly' | 'lifetime';

export interface IPackageLimit {
    maxUsers?: number;
    maxOutlets?: number;
    maxStorage?: number; // in MB
    maxProducts?: number;
    maxOrders?: number; // Per month
}

export interface IPackage {
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency: string;
    billingCycle: IBillingCycle;

    // Legacy support (optional now implies tiers)
    supportType?: ISupportType;

    features: string[]; // List of feature keys enabled
    limits: IPackageLimit;

    // Modules included in this package
    moduleAccess: {
        pos: boolean;
        erp: boolean;
        hrm: boolean;
        ecommerce: boolean;
        crm: boolean;
        logistics: boolean;
        accounting: boolean;
        reports: boolean;
        api_access: boolean;
    };

    isActive: boolean;
    isFeatured: boolean;
}

export type PackageModel = Model<IPackage>;
