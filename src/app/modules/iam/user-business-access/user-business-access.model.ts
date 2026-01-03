import { model, Schema, Types, Document } from "mongoose";

export interface IUserBusinessAccess extends Document {
    user: Types.ObjectId;
    role: Types.ObjectId;
    scope: 'GLOBAL' | 'BUSINESS' | 'OUTLET';
    businessUnit?: Types.ObjectId | null;
    outlet?: Types.ObjectId | null;
    restrictedModules?: string[];
    status: 'active' | 'suspended';
    isPrimary: boolean;
    assignedBy?: Types.ObjectId;
    assignedAt: Date;
    expiresAt?: Date;
    notes?: string;
    dataScopeOverride?: 'own' | 'outlet' | 'business' | 'global' | null;
}

const UserBusinessAccessSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },

    // Scope Defines the Context Level
    scope: {
        type: String,
        enum: ['GLOBAL', 'BUSINESS', 'OUTLET'],
        required: true
    },

    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', default: null },
    outlet: { type: Schema.Types.ObjectId, ref: 'Outlet', default: null },

    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
        default: 'ACTIVE'
    },
    // Explicitly deny access to these modules for this user in this specific Business Unit
    restrictedModules: [{
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics']
    }],

    isPrimary: {
        type: Boolean,
        default: false
    },

    // Audit Fields
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
    notes: { type: String },

    // Data Scope Override regarding this specific role assignment
    dataScopeOverride: {
        type: String,
        enum: ['own', 'outlet', 'business', 'global', null],
        default: null
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure a user doesn't have duplicate roles for the EXACT same context
UserBusinessAccessSchema.index({ user: 1, role: 1, businessUnit: 1, outlet: 1 }, { unique: true });

// Validation Middleware to enforce scope rules
UserBusinessAccessSchema.pre('save', function (next) {
    if (this.scope === 'GLOBAL') {
        if (this.businessUnit || this.outlet) return next(new Error('GLOBAL scope cannot have businessUnit or outlet assigned.'));
    }
    if (this.scope === 'BUSINESS') {
        if (!this.businessUnit) return next(new Error('BUSINESS scope must have businessUnit assigned.'));
        if (this.outlet) return next(new Error('BUSINESS scope cannot have outlet assigned (use OUTLET scope).'));
    }
    if (this.scope === 'OUTLET') {
        if (!this.businessUnit) return next(new Error('OUTLET scope must have businessUnit assigned.'));
        if (!this.outlet) return next(new Error('OUTLET scope must have outlet assigned.'));
    }
    next();
});

export const UserBusinessAccess = model<IUserBusinessAccess>('UserBusinessAccess', UserBusinessAccessSchema);
