import { Document, Types } from "mongoose";

import type {
  ActionType,
  PermissionConditionOperatorType,
  PermissionEffectType,
  PermissionModuleType,
  PermissionScopeType,
  ResolveStrategy,
  ResourceType,
} from "./permission.constant.js";

export interface ITargetScope {
  businessUnitId?: string | undefined;
  outletId?: string | undefined;
  organizationId?: string | undefined;
}

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
  module: PermissionModuleType;
  resource: ResourceType;
  action: ActionType;
  scope: PermissionScopeType;
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
export interface IPermissionGroup extends Document {
  name: string;
  module: PermissionModuleType;
  description: string;
  permissions: Types.ObjectId[] | IPermission[];
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
    organizations?: string[];
    businessUnits: string[];
    outlets?: string[];
    branches?: string[];
    vendorId?: string;
    region?: string;
  };
  resource?: {
    id?: string;
    ownerId?: string;
    organizationId?: string;
    businessUnitId?: string;
    outletId?: string;
    vendorId?: string;
    category?: string;
    region?: string;
  };
  scope?: ITargetScope;
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

export interface IAuthorizationContext {
  permissions: IPermission[];
  maxDataAccess: any;
  hierarchyLevel: number;
  dataScope: string;
  scopeRank: number;
}
