import { Schema, model } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";

export interface IAuditLog {
    action: string; // e.g., 'CREATE_ORDER', 'LOGIN'
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    actor: {
        userId: Schema.Types.ObjectId;
        role?: string;
        ip?: string;
    };
    target: {
        resource: string; // e.g., 'Order'
        resourceId: string;
    };
    company?: Schema.Types.ObjectId;
    businessUnit?: Schema.Types.ObjectId; // Optional for platform-level actions
    scope: 'GLOBAL' | 'COMPANY' | 'BUSINESS' | 'OUTLET';
    requestPayload?: Record<string, any>; // Sanitized body
    responseStatus?: number; // HTTP Status
    duration?: number; // ms
    changes?: Record<string, any>; // Diff
    metadata?: Record<string, any>;
    timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
    action: { type: String, required: true },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true,
        index: true
    },
    actor: {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String },
        ip: { type: String }
    },
    target: {
        resource: { type: String, required: true },
        resourceId: { type: String, required: true }
    },
    company: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: false }, // Optional for platform-level actions
    scope: { type: String, enum: ['GLOBAL', 'COMPANY', 'BUSINESS', 'OUTLET'], default: 'BUSINESS' },
    requestPayload: { type: Schema.Types.Mixed }, // Store sanitized payload
    responseStatus: { type: Number },
    duration: { type: Number },
    changes: { type: Schema.Types.Mixed }, // Store diffs
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true // createdAt/updatedAt
});

auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ businessUnit: 1, module: 1 });

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);

// Apply Context-Aware Data Isolation
auditLogSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
