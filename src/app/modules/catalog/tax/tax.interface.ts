import { Types, Model } from 'mongoose';

export interface ITax {
    _id: string;
    name: string; // e.g., "VAT 15%"
    rate: number; // e.g., 15
    type: 'percentage' | 'fixed';
    businessUnit: Types.ObjectId | null; // null for global
    isDefault: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TaxModel = Model<ITax, object>;
