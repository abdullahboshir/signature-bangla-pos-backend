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
  roleScope: 'GLOBAL' | 'BUSINESS' | 'OUTLET';
  associatedModules?: string[];
  hierarchyLevel: number;
  limits: {
    financial: {
      maxDiscountPercent: number;    // 0-100
      maxDiscountAmount: number;     // max single discount
      maxRefundAmount: number;       // max auto-approval refund
      maxCreditLimit: number;        // max credit allowed
      maxCashTransaction: number;    // max cash handling limit
    };
    dataAccess: {
      maxProducts: number;           // 0 = Unlimited
      maxOrders: number;
      maxCustomers: number;
      maxOutlets: number;
      maxWarehouses: number;
    };
    security: {
      maxLoginSessions: number;
      ipWhitelistEnabled: boolean;
      loginTimeRestricted: boolean; // e.g. 9AM-6PM only
    };
    approval: {
      maxPurchaseOrderAmount: number;
      maxExpenseEntry: number;
    }
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}
