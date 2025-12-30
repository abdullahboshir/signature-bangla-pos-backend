import { Types, Model } from 'mongoose';

export interface IUnit {
    _id: string; // Add this if you want to use it in frontend without casting
    name: string; // e.g., "Kilogram"
    symbol: string; // e.g., "kg"
    status: 'active' | 'inactive';
    businessUnit: Types.ObjectId | null; // Reference to the business unit, null for global
    relatedBusinessTypes?: string[]; // e.g., ["Grocery", "Pharmacy"]
    createdBy: Types.ObjectId;
    isDeleted: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UnitModel = Model<IUnit, object>;
