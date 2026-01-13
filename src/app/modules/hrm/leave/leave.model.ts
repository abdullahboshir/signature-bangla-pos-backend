import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface ILeave {
    staff: Schema.Types.ObjectId;
    leaveType: Schema.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: Schema.Types.ObjectId;
    rejectionReason?: string;
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
}

const leaveSchema = new Schema<ILeave>({
    staff: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: Schema.Types.ObjectId, ref: 'LeaveType', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true }
}, {
    timestamps: true
});

export const Leave = model<ILeave>('Leave', leaveSchema);

// Apply Context-Aware Data Isolation
leaveSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
