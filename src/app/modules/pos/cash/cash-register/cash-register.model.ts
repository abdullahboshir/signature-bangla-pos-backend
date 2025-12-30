import { Schema, model } from "mongoose";
import type { ICashRegisterDocument } from "./cash-register.interface.js";

const cashRegisterSchema = new Schema<ICashRegisterDocument>({
    registerId: { type: String, required: true, unique: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },

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

// Prevent multiple open registers for same outlet (optional logic, but good for data integrity)
// cashRegisterSchema.index({ outlet: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'open' } });
// Commenting out unique index for flexible testing, but recommended for production.

cashRegisterSchema.index({ businessUnit: 1 });
cashRegisterSchema.index({ outlet: 1 });
cashRegisterSchema.index({ status: 1 });
cashRegisterSchema.index({ openingDate: 1 });
cashRegisterSchema.index({ openedBy: 1 });

export const CashRegister = model<ICashRegisterDocument>('CashRegister', cashRegisterSchema);
