import { Model, Document } from "mongoose";

export interface IAttributeField {
    key: string;          // e.g. "expiryDate"
    label: string;        // e.g. "Expiry Date"
    type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
    required: boolean;
    options?: string[];   // For 'select' type
    placeholder?: string;
}

export interface IAttributeGroup {
    name: string;         // e.g. "Pharmacy Template"
    description?: string;
    fields: IAttributeField[];
    isActive: boolean;
}

export interface IAttributeGroupDocument extends IAttributeGroup, Document { }

export interface IAttributeGroupModel extends Model<IAttributeGroupDocument> { }
