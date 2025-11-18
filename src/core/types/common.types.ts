import type { Types } from "mongoose";

export type TName = {
  firstName: string;
  lastName: string;
  firstNameBangla?: string;
  lastNameBangla?: string;
};


export interface ICommon {
  id: string;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}