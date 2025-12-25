import { Document, Types } from "mongoose";

export interface IExpense extends Document {
    expenseId: string; // Readable ID e.g., EXP-202410-001
    date: Date;
    amount: number;
    category: Types.ObjectId;
    paymentMethod: 'cash' | 'bank' | 'mobile_money' | 'other';
    reference?: string;
    remarks?: string;
    businessUnit: Types.ObjectId;
    outlet?: Types.ObjectId;
    createdBy: Types.ObjectId;
    status: 'pending' | 'approved' | 'rejected';
    attachments?: string[];
}

export interface IExpenseDocument extends IExpense, Document { }
