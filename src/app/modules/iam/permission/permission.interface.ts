import { type Types } from "mongoose";
import type {
  ActionType,
  PermissionConditionOperatorType,
  PermissionEffectType,
  PermissionScope,
  ResolveStrategy,
  ResourceType,
} from "./permission.constant.js";

export interface IPermissionCondition {
  field: string;
  operator: PermissionConditionOperatorType;
  value: any;
}



export interface IPermissionResolver {
  strategy: ResolveStrategy;
  priority?: number;
  inheritFrom?: string[];
  override?: boolean;
  fallback?: PermissionEffectType;
}



export interface IPermission {
  id: string;
  resource: ResourceType;
  action: ActionType;
  scope: PermissionScope;
  effect: PermissionEffectType;
  attributes?: string[];
  conditions?: IPermissionCondition[];
  resolver?: IPermissionResolver;
  description: string;
  descriptionBangla?: string;
  isActive: boolean;
  metadata?: {
    category?: string;
    module?: string;
    version?: string;
    tags?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}


// separate model for permission groups
export interface IPermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  resolver: IPermissionResolver;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}



// Run time environment for permission evaluation 
export interface IPermissionContext {
  user: {
    id: string;
    roles: string[];
    businessUnits: string[];
    branches?: string[];
    vendorId?: string;
    region?: string;
  };
  resource?: {
    id?: string;
    ownerId?: string;
    vendorId?: string;
    category?: string;
    region?: string;
  };
  scope?: {
    businessUnitId?: string;
    outletId?: string;
  };
  environment?: {
    ip?: string;
    userAgent?: string;
    timeOfDay?: string;
  };
}

export interface IPermissionResult {
  allowed: boolean;
  permission?: IPermission;
  reason?: string;
  attributes?: string[];
  conditions?: IPermissionCondition[];
  resolvedBy?: string;
}













