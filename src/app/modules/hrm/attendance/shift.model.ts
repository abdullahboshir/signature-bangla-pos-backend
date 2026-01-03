import { Schema, model } from "mongoose";

export interface IShift {
    name: string; // e.g. "Morning Shift", "Night Shift"
    startTime: string; // "09:00"
    endTime: string; // "17:00"
    // Module: e.g. POS shifts are strict, Office shifts are flexible
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const shiftSchema = new Schema<IShift>({
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'hrm',
        required: true,
        index: true
    },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

shiftSchema.index({ name: 1, businessUnit: 1 }, { unique: true });
shiftSchema.index({ module: 1 });

export const Shift = model<IShift>('Shift', shiftSchema);
