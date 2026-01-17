import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IAttendance {
    staff: Schema.Types.ObjectId;
    date: Date;
    checkIn: Date;
    checkOut?: Date;
    status: 'present' | 'late' | 'half-day' | 'absent';
    notes?: string;
    company: Schema.Types.ObjectId;
    businessUnit: Schema.Types.ObjectId;
}

const attendanceSchema = new Schema<IAttendance>({
    staff: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming Staff are Users
    date: { type: Date, required: true }, // Normalized to start of day
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    status: {
        type: String,
        enum: ['present', 'late', 'half-day', 'absent'],
        default: 'present'
    },
    notes: { type: String },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }
}, {
    timestamps: true
});

// Prevent duplicate attendance for same staff on same day
attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);

// Apply Context-Aware Data Isolation
attendanceSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
