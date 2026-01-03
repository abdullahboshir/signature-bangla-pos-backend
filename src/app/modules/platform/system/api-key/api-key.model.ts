import { Schema, model } from "mongoose";

export interface IApiKey {
    name: string;
    key: string;
    secret: string;
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    scopes: string[]; // e.g., ['orders:read', 'products:write']
    businessUnit: Schema.Types.ObjectId;
    isActive: boolean;
    expiresAt?: Date;
    lastUsedAt?: Date;
    createdBy: Schema.Types.ObjectId;
}

const apiKeySchema = new Schema<IApiKey>({
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    secret: { type: String, required: true, select: false },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        required: true
    },
    scopes: [{ type: String }],
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    lastUsedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

apiKeySchema.index({ key: 1 });
apiKeySchema.index({ businessUnit: 1 });
apiKeySchema.index({ module: 1 });

export const ApiKey = model<IApiKey>('ApiKey', apiKeySchema);
