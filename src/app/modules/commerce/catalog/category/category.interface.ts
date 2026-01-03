import type { Types } from "mongoose";

export interface ICategories {
  businessUnit: Types.ObjectId;
  name: string;
  description?: string;
  code?: string;
  slug?: string;
  image?: string;
  availableModules?: ('pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system')[];
  isActive?: boolean;
  parentId?: Types.ObjectId | null;
  level?: number;
  path?: string;
  createdAt?: Date;
  updatedAt?: Date;

  isDeleted?: boolean;
  deletedAt?: Date;
}
