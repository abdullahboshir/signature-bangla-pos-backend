import { Schema, model } from "mongoose";
import type { IAttributeGroupDocument, IAttributeGroupModel } from "./attribute-group.interface.ts";


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
    fields: [AttributeFieldSchema],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});

export const AttributeGroup = model<IAttributeGroupDocument, IAttributeGroupModel>("AttributeGroup", AttributeGroupSchema);
