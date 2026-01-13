import { Schema, model } from "mongoose";
import type { ICashRegisterDocument } from "./cash-register.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

const cashRegisterSchema = new Schema<ICashRegisterDocument>({
    registerId: { type: String, required: true, unique: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true, index: true },

    openedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    openingDate: { type: Date, required: true, default: Date.now },
    openingBalance: { type: Number, required: true, min: 0 },

    closedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    closingDate: { type: Date },
    closingBalance: { type: Number },

    systemExpectedBalance: { type: Number },
    difference: { type: Number },

    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    remarks: { type: String }
}, {
    timestamps: true
});



cashRegisterSchema.index({ businessUnit: 1 });
cashRegisterSchema.index({ outlet: 1 });
cashRegisterSchema.index({ status: 1 });
cashRegisterSchema.index({ openingDate: 1 });
cashRegisterSchema.index({ openedBy: 1 });

export const CashRegister = model<ICashRegisterDocument>('CashRegister', cashRegisterSchema);

// Apply Context-Aware Data Isolation
cashRegisterSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit',
    outletField: 'outlet'
});
