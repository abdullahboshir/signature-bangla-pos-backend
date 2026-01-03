import { Schema, model } from "mongoose";
import type { IAttributeDocument, IAttributeModel } from "./attribute.interface.ts";


const attributeSchema = new Schema<IAttributeDocument, IAttributeModel>({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true, // Unique per Business Unit logic handled in service if needed, but simple unique for now
    },
    values: [{
        type: String,
        trim: true
    }],
    businessUnit: {
        type: Schema.Types.ObjectId,
        ref: "BusinessUnit",
        required: false
    },
    availableModules: {
        type: [{
            type: String,
            enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system']
        }],
        default: ['pos', 'ecommerce'],
        index: true
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true
    }
});

attributeSchema.index({ businessUnit: 1 });
attributeSchema.index({ status: 1 });
attributeSchema.index({ name: 1, businessUnit: 1 }, { unique: true });

export const Attribute = model<IAttributeDocument, IAttributeModel>("Attribute", attributeSchema);
