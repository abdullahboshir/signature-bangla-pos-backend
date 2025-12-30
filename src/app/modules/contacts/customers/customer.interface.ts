import type { Types } from "mongoose";
import type { TName } from "../../../../core/types/common.types.js";

export type TAddress = {
  country: string;
  division: string;
  district: string;
  subDistrict: string;
  alliance?: string;
  village?: string;
  region?: string;
  type: "home" | "work" | "other";
  street: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
};

export interface ICustomer {
  _id?: Types.ObjectId;
  id: string;
  user: Types.ObjectId;
  name?: TName;
  email: string;
  phone?: string;
  addresses?: TAddress[];
  avatar?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  preferences?: {
    language?: "en" | "bn";
    addresses?: TAddress[];
    currency?: "BDT" | "USD";
    newsletter?: boolean;
    smsNotifications?: boolean;
    emailNotifications?: boolean;
  };
  loyaltyPoints?: number;
  membershipTier?: "regular" | "silver" | "gold" | "platinum";
  wishlist?: Types.ObjectId[];
  recentlyViewed?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
