import { Schema, model } from 'mongoose';
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";
import { auditDiffPlugin } from '../../../../../core/plugins/mongoose-diff.plugin.js';
import type { IOutlet, IOutletModel } from './outlet.interface.js';
import { brandingSchema, contactSchema, locationSchema } from "../shared/common.schema.js";

const outletSchema = new Schema<IOutlet, IOutletModel>(
    {
        branding: { type: brandingSchema, required: true },
        name: { type: String, required: true, trim: true },
        contact: { type: contactSchema, required: true },
        location: { type: locationSchema, required: true },

        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },

        // Outlet-specific module overrides
        activeModules: {
            pos: { type: Boolean, default: true },
            erp: { type: Boolean, default: true },
            hrm: { type: Boolean, default: false },
            ecommerce: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            logistics: { type: Boolean, default: false }
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
            index: true
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: "BusinessUnit",
            required: true
        },
        manager: {
            name: { type: String },
            phone: { type: String },
            email: { type: String },
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        }
    }
);

// Virtual for outlet settings
outletSchema.virtual('settings', {
    ref: 'OutletSettings',
    localField: '_id',
    foreignField: 'outlet',
    justOne: true
});

// Compound index to ensure unique code per business unit
outletSchema.index({ code: 1, businessUnit: 1 }, { unique: true });
outletSchema.index({ isActive: 1 });
outletSchema.index({ manager: 1 });

outletSchema.statics['isCodeTaken'] = async function (code: string, businessUnitId: string, session?: any): Promise<boolean> {
    const existingOutlet = await this.findOne({ code, businessUnit: businessUnitId }).session(session || null);
    return !!existingOutlet;
};

// Apply Audit Diff Plugin
(outletSchema as any).plugin(auditDiffPlugin);

export const Outlet = model<IOutlet, IOutletModel>('Outlet', outletSchema);

// Apply Context-Aware Data Isolation
outletSchema.plugin(contextScopePlugin, {
    companyField: 'organization',
    businessUnitField: 'businessUnit'
});
