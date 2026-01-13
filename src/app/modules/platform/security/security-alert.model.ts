import { Schema, model, Types, Document } from 'mongoose';

export interface ISecurityAlert extends Document {
    type: 'UNAUTHORIZED_READ' | 'UNAUTHORIZED_WRITE' | 'CONTEXT_HIJACKING' | 'INVALID_ONBOARDING';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    collectionName?: string;
    action: string;
    context: {
        userId?: Types.ObjectId;
        companyId?: Types.ObjectId;
        businessUnitId?: Types.ObjectId;
        outletId?: Types.ObjectId;
        ip?: string;
        userAgent?: string;
        path?: string;
    };
    details: string;
    timestamp: Date;
}

const SecurityAlertSchema = new Schema<ISecurityAlert>({
    type: {
        type: String,
        enum: ['UNAUTHORIZED_READ', 'UNAUTHORIZED_WRITE', 'CONTEXT_HIJACKING', 'INVALID_ONBOARDING'],
        required: true
    },
    severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true
    },
    collectionName: { type: String },
    action: { type: String, required: true },
    context: {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
        businessUnitId: { type: Schema.Types.ObjectId, ref: 'BusinessUnit' },
        outletId: { type: Schema.Types.ObjectId, ref: 'Outlet' },
        ip: { type: String },
        userAgent: { type: String },
        path: { type: String }
    },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

SecurityAlertSchema.index({ type: 1, severity: 1 });
SecurityAlertSchema.index({ 'context.userId': 1 });
SecurityAlertSchema.index({ 'context.companyId': 1 });
SecurityAlertSchema.index({ timestamp: -1 });

export const SecurityAlert = model<ISecurityAlert>('SecurityAlert', SecurityAlertSchema);
