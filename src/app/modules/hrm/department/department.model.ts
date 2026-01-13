import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IDepartment {
    name: string;
    code: string;
    description?: string;
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    businessUnit: Schema.Types.ObjectId;
    parentId?: Schema.Types.ObjectId;
    headOfDepartment?: Schema.Types.ObjectId; // Staff ID
    company: Schema.Types.ObjectId;
    isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true,
        default: 'hrm'
    },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    headOfDepartment: { type: Schema.Types.ObjectId, ref: 'Staff' },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

departmentSchema.index({ businessUnit: 1, code: 1 }, { unique: true });
departmentSchema.index({ module: 1 });

export const Department = model<IDepartment>('Department', departmentSchema);

// Apply Context-Aware Data Isolation
departmentSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
