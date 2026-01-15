import { Model, Document, Types } from "mongoose";

export interface IAttributeField {
    key: string;          // e.g. "expiryDate"
    label: string;        // e.g. "Expiry Date"
    type: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'textarea';
    required: boolean;
    options?: string[];   // For 'select' type
    placeholder?: string;
}

export interface IAttributeGroup {
    name: string;
    code: string;
    description?: string;
    availableModules: ('pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'marketing' | 'integrations' | 'system')[];
    fields: IAttributeField[];
    sortOrder: number;
    isActive: boolean;
    company: Types.ObjectId;
    businessUnit: Types.ObjectId;
}

export interface IAttributeGroupDocument extends IAttributeGroup, Document { }

export interface IAttributeGroupModel extends Model<IAttributeGroupDocument> { }
