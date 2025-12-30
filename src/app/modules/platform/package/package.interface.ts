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
    supportType: ISupportType;
    isActive: boolean;
    isFeatured: boolean;
}

export type PackageModel = Model<IPackage>;
