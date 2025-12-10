import { Document, Types } from "mongoose";

export interface IChildCategory extends Document {
  name: string;
  businessUnit: Types.ObjectId;
  subCategory: Types.ObjectId;
  code?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
