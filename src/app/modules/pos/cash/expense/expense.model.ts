import { Schema, model } from "mongoose";
import type { IExpenseDocument } from "./expense.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";


const expenseSchema = new Schema<IExpenseDocument>({
    expenseId: { type: String, required: true, unique: true },
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'mobile_money', 'other'],
        required: true
    },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'pos',
        required: true,
        index: true
    },
    reference: { type: String },
    remarks: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    attachments: [{ type: String }]
}, {
    timestamps: true
});

// Indexes for reporting
expenseSchema.index({ businessUnit: 1, date: -1 }); // Financial Reports
expenseSchema.index({ date: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ outlet: 1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ paymentMethod: 1 });

export const Expense = model<IExpenseDocument>('Expense', expenseSchema);

// Apply Context-Aware Data Isolation
expenseSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit',
    outletField: 'outlet'
});
