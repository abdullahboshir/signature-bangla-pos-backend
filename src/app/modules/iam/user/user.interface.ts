import type { Model, Types } from "mongoose";


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
  isSuperAdmin?: boolean;
  globalRoles: Types.ObjectId[];
  // Virtual Populated Field
  businessAccess?: any[];
  // Removed deprecated fields: businessUnits, roles
  branches?: string[];
  vendorId?: string;
  region?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: TUserStatus;
  avatar?: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  setupPasswordToken?: string;
  setupPasswordExpires?: Date;
  isDeleted: boolean;
  directPermissions?: {
    permissionId: Types.ObjectId;
    type: 'allow' | 'deny';
    source: 'DIRECT' | 'GROUP' | 'INHERITED' | 'SYSTEM' | 'POLICY';
    assignedScope: 'GLOBAL' | 'BUSINESS' | 'OUTLET';
  }[];
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
