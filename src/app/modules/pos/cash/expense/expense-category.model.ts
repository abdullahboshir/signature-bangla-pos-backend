import { Schema, model } from "mongoose";
import type { IExpenseCategoryDocument } from "./expense-category.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

const expenseCategorySchema = new Schema<IExpenseCategoryDocument>({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['fixed', 'variable'],
        default: 'variable'
    },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true,
        default: 'pos', // Most expenses are POS based initially
        index: true
    },
    isActive: { type: Boolean, default: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', index: true },
    description: { type: String }
}, {
    timestamps: true
});

// Compound index to prevent duplicate names within the same Business Unit
expenseCategorySchema.index({ name: 1, businessUnit: 1 }, { unique: true });
expenseCategorySchema.index({ businessUnit: 1 });
expenseCategorySchema.index({ isActive: 1 });

export const ExpenseCategory = model<IExpenseCategoryDocument>('ExpenseCategory', expenseCategorySchema);

// Apply Context-Aware Data Isolation
expenseCategorySchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
