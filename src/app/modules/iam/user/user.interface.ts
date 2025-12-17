import type { Model, Types } from "mongoose";

import type { IPermission } from "../permission/permission.interface.js";
import type { USER_STATUS } from "./user.constant.js";
import type { TName } from "@core/types/common.types.ts";

export type TUserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface IUser {
  _id?: Types.ObjectId;
  id: string;
  name?: TName;
  email: string;
  phone?: string;
  password: string;
  businessUnits?: Types.ObjectId[] | string[];
  roles: Types.ObjectId[];
  branches?: string[];
  vendorId?: string;
  region?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: TUserStatus;
  avatar?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  isDeleted: boolean;
  directPermissions?: IPermission[];
  restrictions?: {
    maxDiscountPercentage?: number;
    allowedCategories?: Types.ObjectId[];
    allowedVendors?: Types.ObjectId[];
    workingHours?: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  isActive: boolean;
  lastLogin?: Date;
  loginHistory: {
    date: Date;
    ip: string;
    userAgent: string;
  }[];
  settings?: {
    theme?: string;
    tableHeight?: string;
  };
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatic extends Model<IUser> {
  isUserExists(email: string): Promise<IUser>;
  isPasswordMatched(plainPass: string, hashedPass: string): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedAtTime: Date,
    jwtIssuedTime: number
  ): boolean;
}
