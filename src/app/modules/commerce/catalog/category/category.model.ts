import { Schema, model } from "mongoose";
import type { ICategories } from "./category.interface.js";
import { makeSlug } from "@core/utils/utils.common.ts";


const CategorySchema = new Schema<ICategories>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 50,
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
      index: true,
    },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: false,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      index: true,
    },
    path: {
      type: String, // Materialized Path: /rootID/subID/
      default: "/",
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

// Self-referencing index for tree traversal optimization
CategorySchema.index({ parentId: 1, businessUnit: 1 });
CategorySchema.index({ level: 1 });

CategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = makeSlug(this.name);
  }
  next();
});

// Compound indexes for scoped uniqueness
CategorySchema.index({ name: 1, businessUnit: 1 }, { unique: true });
CategorySchema.index({ slug: 1, businessUnit: 1 }, { unique: true });

export const Category = model<ICategories>("Category", CategorySchema);
