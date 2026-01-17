import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IAccountHead {
    name: string; // "Cash on Hand", "Bank Asia"
    code: string; // "1001", "1002"
    type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
    parentAccount?: Schema.Types.ObjectId;

    // Module: 'pos' (Cash Drawer mapping), 'erp' (General Ledger)
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';

    balance: number;
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const accountHeadSchema = new Schema<IAccountHead>({
    name: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['asset', 'liability', 'equity', 'income', 'expense'], required: true },
    parentAccount: { type: Schema.Types.ObjectId, ref: 'AccountHead' },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'erp',
        required: true,
        index: true
    },
    balance: { type: Number, default: 0 },
    company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

accountHeadSchema.index({ code: 1, businessUnit: 1 }, { unique: true });
accountHeadSchema.index({ module: 1 });

export const AccountHead = model<IAccountHead>('AccountHead', accountHeadSchema);

// Apply Context-Aware Data Isolation
accountHeadSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
