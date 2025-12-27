import { Schema, model } from "mongoose";
import type { IChildCategory } from "./child-category.interface.js";
import { makeSlug } from "@core/utils/utils.common.ts";


const ChildCategorySchema = new Schema<IChildCategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 50,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      maxlength: 60,
    },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "BusinessUnit",
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
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

ChildCategorySchema.index({ businessUnit: 1 });
ChildCategorySchema.index({ subCategory: 1 });
ChildCategorySchema.index({ isActive: 1 });
ChildCategorySchema.index({ slug: 1, businessUnit: 1 }, { unique: true });



ChildCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = makeSlug(this.name);
  }
  next();
});

export const ChildCategory = model('ChildCategory', ChildCategorySchema);
