import type { Document, Types } from "mongoose";

export interface IProductWarrantyReturns {
  product: Types.ObjectId;
  
  warranty: {
    hasWarranty: boolean;
    type: "seller" | "manufacturer" | "brand";
    duration: number;
    periodUnit: "days" | "months" | "years";
    details: string;
    serviceCenters: string[];
    termsConditions: string;
  };
  
  returnPolicy: {
    allowed: boolean;
    period: number;
    conditions: string[];
    refundMethods: ["wallet", "original_payment", "bank_transfer"];
    returnShipping: "seller_paid" | "buyer_paid";
    nonReturnableConditions: string[];
  };
  
  updatedAt: Date;
}

export type IProductWarrantyReturnsDocument = IProductWarrantyReturns & Document;