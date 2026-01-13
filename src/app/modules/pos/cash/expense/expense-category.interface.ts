import { Document, Types } from "mongoose";

export interface IExpenseCategory {
    name: string;
    type: 'fixed' | 'variable';
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    isActive: boolean;
    company: Types.ObjectId; // Reference to the company
    businessUnit: Types.ObjectId; // If null, it's a global category
    description?: string;
}

export interface IExpenseCategoryDocument extends IExpenseCategory, Document { }
