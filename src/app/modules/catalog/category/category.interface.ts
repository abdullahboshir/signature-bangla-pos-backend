import type { Types } from "mongoose";

export interface ICategories {
  businessUnit: Types.ObjectId;
  name: string;
  description?: string;
  code?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
