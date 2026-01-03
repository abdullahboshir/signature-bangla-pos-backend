import { Schema, model } from "mongoose";
import type { IBrand } from "./brand.interface.ts";
import { makeSlug } from "@core/utils/utils.common.ts";

const BrandSchema = new Schema<IBrand>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
            maxlength: 100,
        },
        availableModules: {
            type: [{
                type: String,
                enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system']
            }],
            default: ['pos', 'ecommerce'],
            index: true
        },
        slug: {
            type: String,
            unique: true,
            index: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        logo: {
            type: String,
        },
        website: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        businessUnit: {
            type: Schema.Types.ObjectId,
            ref: "BusinessUnit",
            required: false, // Can be global or BU specific
        },
    },
    { timestamps: true }
);

BrandSchema.index({ businessUnit: 1 });
BrandSchema.index({ status: 1 });

BrandSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = makeSlug(this.name);
    }
    next();
});

export const Brand = model<IBrand>("Brand", BrandSchema);
