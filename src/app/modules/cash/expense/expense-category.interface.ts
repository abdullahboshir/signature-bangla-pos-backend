import { Document, Types } from "mongoose";

export interface IExpenseCategory extends Document {
    name: string;
    type: 'fixed' | 'variable';
    isActive: boolean;
    businessUnit?: Types.ObjectId; // If null, it's a global category
    description?: string;
}

export interface IExpenseCategoryDocument extends IExpenseCategory, Document { }
