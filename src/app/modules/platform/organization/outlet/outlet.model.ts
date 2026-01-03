import { Schema, model } from "mongoose";
import type { IOutlet, IOutletModel } from "./outlet.interface.ts";


const outletSchema = new Schema<IOutlet, IOutletModel>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String
        },
        postalCode: {
            type: String
        },
        country: {
            type: String,
            required: true,
            default: "Bangladesh"
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String
        },
        // Outlet-specific module overrides (e.g. this outlet only does POS, no Logistics)
        activeModules: {
            pos: { type: Boolean, default: true },
            erp: { type: Boolean, default: true },
            hrm: { type: Boolean, default: false },
            ecommerce: { type: Boolean, default: false },
            crm: { type: Boolean, default: false },
            logistics: { type: Boolean, default: false }
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: "BusinessUnit",
            required: true,
            index: true
        },
        manager: {
            type: Schema.Types.ObjectId,
            ref: "User"
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

// Compound index to ensure unique code per business unit
outletSchema.index({ code: 1, businessUnit: 1 }, { unique: true });
outletSchema.index({ isActive: 1 });
outletSchema.index({ manager: 1 });

outletSchema.statics['isCodeTaken'] = async function (code: string, businessUnitId: string): Promise<boolean> {
    const existingOutlet = await this.findOne({ code, businessUnit: businessUnitId });
    return !!existingOutlet;
};

export const Outlet = model<IOutlet, IOutletModel>("Outlet", outletSchema);
