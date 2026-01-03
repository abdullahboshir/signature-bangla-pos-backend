import { Types, Model, Document } from 'mongoose';

export interface ITax extends Document {
    _id: string;
    name: string; // e.g., "VAT 15%"
    rate: number; // e.g., 15
    type: 'percentage' | 'fixed';
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    businessUnit: Types.ObjectId | null; // null for global
    isDefault: boolean;
    isActive: boolean;
    isDeleted: boolean;
    createdBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export type TaxModel = Model<ITax, object>;
