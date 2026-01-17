import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface ILeaveType {
    name: string; // e.g. "Sick Leave", "Casual Leave"
    code: string;
    daysAllowed: number;
    // Module: Some leaves might be specific to factory workers (erp) 
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    isPaid: boolean;
    isActive: boolean;
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
}

const leaveTypeSchema = new Schema<ILeaveType>({
    name: { type: String, required: true },
    code: { type: String, required: true, uppercase: true },
    daysAllowed: { type: Number, required: true },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'hrm',
        required: true,
        index: true
    },
    isPaid: { type: Boolean, default: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

leaveTypeSchema.index({ code: 1, businessUnit: 1 }, { unique: true });
leaveTypeSchema.index({ module: 1 });

export const LeaveType = model<ILeaveType>('LeaveType', leaveTypeSchema);

// Apply Context-Aware Data Isolation
leaveTypeSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
