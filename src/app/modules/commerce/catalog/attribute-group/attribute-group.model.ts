import { Schema, model } from "mongoose";
import type { IAttributeGroupDocument, IAttributeGroupModel } from "./attribute-group.interface.js";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";


const AttributeFieldSchema = new Schema({
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'number', 'date', 'select', 'boolean', 'textarea'],
        required: true
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    placeholder: { type: String }
}, { _id: false });

const AttributeGroupSchema = new Schema<IAttributeGroupDocument, IAttributeGroupModel>({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    module: {
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
        default: 'erp',
        required: true,
        index: true
    },
    fields: [AttributeFieldSchema],
    isActive: { type: Boolean, default: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, index: true }
}, {
    timestamps: true,
    versionKey: false
});

export const AttributeGroup = model<IAttributeGroupDocument, IAttributeGroupModel>("AttributeGroup", AttributeGroupSchema);

// Apply Context-Aware Data Isolation
AttributeGroupSchema.plugin(contextScopePlugin, {
    companyField: 'company',
    businessUnitField: 'businessUnit'
});
