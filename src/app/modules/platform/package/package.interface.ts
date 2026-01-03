import { Model, Types as _Types } from 'mongoose';

export type ISupportType = 'basic' | 'priority' | 'dedicated';

export interface IPackageLimit {
    maxUsers?: number;
    maxOutlets?: number;
    maxStorage?: number; // in MB
}

export interface IPackage {
    name: string;
    slug: string;
    description?: string;
    price: number;
    currency: string;
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
    };

    supportType: ISupportType;
    isActive: boolean;
    isFeatured: boolean;
}

export type PackageModel = Model<IPackage>;
