import type { Document, Types } from "mongoose";

export interface IWarranty {
  name: string;
  duration: number; // e.g., 12
  periodUnit: "days" | "weeks" | "months" | "years"; // e.g., "months"
  type: "seller" | "manufacturer" | "brand";
  description?: string;
  termsConditions?: string;
  availableModules: string[];
  isActive: boolean;
  company: Types.ObjectId;
  businessUnit?: Types.ObjectId;
}

export type IWarrantyDocument = IWarranty & Document;
