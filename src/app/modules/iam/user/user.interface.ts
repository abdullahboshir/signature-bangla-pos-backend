import type { Model, Types } from "mongoose";
import type { TName } from "../../interface/common.interface.js";
import type { IPermission } from "../permission/permission.interface.js";
import type { USER_STATUS } from "./user.constant.js";

export type TUserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export interface IUser {
  _id?: Types.ObjectId;
  id: string;
  name?: TName;
  email: string;
  phone?: string;
  password: string;
  roles: Types.ObjectId[];
  departments: string[];
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
