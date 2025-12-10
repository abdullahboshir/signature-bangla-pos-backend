import { Document, Types } from "mongoose";

export interface ISubCategory extends Document {
  name: string;
  category: Types.ObjectId;
  businessUnit: Types.ObjectId;
  code?: string;
  slug?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
