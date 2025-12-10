import { Schema, model } from "mongoose";
import type { ICategories } from "./category.interface.js";
import { makeSlug } from "@core/utils/utils.common.ts";


const CategorySchema = new Schema<ICategories>(
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
    },
    businessUnit: {
      type: Schema.Types.ObjectId,
      ref: "Dpartment",
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
  },
  { timestamps: true }
);

CategorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = makeSlug(this.name);
  }
  next();
});

export const Category = model<ICategories>("Category", CategorySchema);
