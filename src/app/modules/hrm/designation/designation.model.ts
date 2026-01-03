import { Schema, model } from "mongoose";

export interface IDesignation {
    name: string;
    code: string;
    description?: string;
    rank: number; // For hierarchy (1 = High)
    department: Schema.Types.ObjectId;
    // Designation level module access hint (e.g., this rank defaults to these modules)
    defaultAccess?: string[];
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
}

const designationSchema = new Schema<IDesignation>({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String },
    rank: { type: Number, required: true, min: 1 },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    defaultAccess: [{
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system']
    }],
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

designationSchema.index({ businessUnit: 1, code: 1 }, { unique: true });
designationSchema.index({ department: 1 });

export const Designation = model<IDesignation>('Designation', designationSchema);
