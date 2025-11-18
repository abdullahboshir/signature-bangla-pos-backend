import type { Types } from "mongoose";


export interface IRole {
  _id?: Types.ObjectId;
  name: string;
  nameBangla?: string;
  description: string;
  descriptionBangla?: string;
  permissions: Types.ObjectId[];
  permissionGroups?: Types.ObjectId[];
  inheritedRoles?: Types.ObjectId[];
  isSystemRole: boolean;
  isDefault: boolean;
  isActive: boolean;
  hierarchyLevel: number;
  maxDataAccess?: {
    products?: number;
    orders?: number;
    customers?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}
