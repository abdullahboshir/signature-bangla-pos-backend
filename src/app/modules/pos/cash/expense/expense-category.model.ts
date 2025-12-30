import { Schema, model } from "mongoose";
import type { IExpenseCategoryDocument } from "./expense-category.interface.ts";

const expenseCategorySchema = new Schema<IExpenseCategoryDocument>({
    name: { type: String, required: true },
    type: {
        type: String,
        enum: ['fixed', 'variable'],
        default: 'variable'
    },
    isActive: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit' },
    description: { type: String }
}, {
    timestamps: true
});

// Compound index to prevent duplicate names within the same Business Unit
expenseCategorySchema.index({ name: 1, businessUnit: 1 }, { unique: true });
expenseCategorySchema.index({ businessUnit: 1 });
expenseCategorySchema.index({ isActive: 1 });

export const ExpenseCategory = model<IExpenseCategoryDocument>('ExpenseCategory', expenseCategorySchema);
