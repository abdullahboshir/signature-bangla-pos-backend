import { model, Schema, Types } from "mongoose";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";
import type { IRole } from "./role.interface.js";
import { cachingMiddleware } from "@core/utils/cacheQuery.ts";




const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [100, 'Role name cannot exceed 100 characters'],
      match: [/^[a-zA-Z0-9_-\s]+$/, 'Role name can only contain letters, numbers, spaces, hyphens and underscores']
    },
    nameBangla: {
      type: String,
      trim: true,
      maxlength: [100, 'Bangla role name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Role description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    descriptionBangla: {
      type: String,
      trim: true,
      maxlength: [500, 'Bangla description cannot exceed 500 characters']
    },
    permissions: [{ type: Types.ObjectId, ref: "Permission", required: true }],
    permissionGroups: [{ type: Types.ObjectId, ref: "PermissionGroup", required: true }],
    inheritedRoles: [{
      type: Types.ObjectId,
      ref: 'Role',
      validate: {
        validator: function (this: IRole, roles: Types.ObjectId[]) {
          return !roles.includes(this._id as unknown as Types.ObjectId);
        },
        message: 'Role cannot inherit from itself'
      }
    }],
    isSystemRole: {
      type: Boolean,
      default: false
    },
    roleScope: {
      type: String,
      enum: ['GLOBAL', 'COMPANY', 'BUSINESS', 'OUTLET'],
      required: true,
      index: true
    },
    // Applicable Modules for this role (e.g. ['pos'] for Cashier, ['hrm'] for HR Manager)
    associatedModules: [{
      type: String,
      enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system'],
    }],
    isDefault: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    hierarchyLevel: {
      type: Number,
      required: [true, 'Hierarchy level is required'],
      min: [1, 'Hierarchy level must be at least 1'],
      max: [100, 'Hierarchy level cannot exceed 100'],
      default: 1
    },
    limits: {
      financial: {
        maxDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
        maxDiscountAmount: { type: Number, default: 0, min: 0 },
        maxRefundAmount: { type: Number, default: 0, min: 0 },
        maxCreditLimit: { type: Number, default: 0, min: 0 },
        maxCashTransaction: { type: Number, default: 0, min: 0 }
      },
      dataAccess: {
        maxProducts: { type: Number, default: 0, min: 0 },
        maxOrders: { type: Number, default: 0, min: 0 },
        maxCustomers: { type: Number, default: 0, min: 0 },
        maxOutlets: { type: Number, default: 0, min: 0 },
        maxWarehouses: { type: Number, default: 0, min: 0 }
      },
      security: {
        maxLoginSessions: { type: Number, default: 1, min: 1 },
        ipWhitelistEnabled: { type: Boolean, default: false },
        loginTimeRestricted: { type: Boolean, default: false }
      },
      approval: {
        maxPurchaseOrderAmount: { type: Number, default: 0, min: 0 },
        maxExpenseEntry: { type: Number, default: 0, min: 0 }
      }
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      default: null, // null for System Roles
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


RoleSchema.index({ isActive: 1, hierarchyLevel: 1 });
RoleSchema.index({ isSystemRole: 1 });
RoleSchema.index({ isDefault: 1 });


// Compound index to ensure name is unique per scope
RoleSchema.index({ name: 1, roleScope: 1 }, { unique: true });

RoleSchema.virtual('allPermissions').get(function (this: IRole) {
  return this.permissions;
});

RoleSchema.pre('save', async function (next) {
  if (this.isDefault) {
    const existingDefault = await model('Role').findOne({
      isDefault: true,
      hierarchyLevel: this.hierarchyLevel,
      _id: { $ne: this._id }
    });

    if (existingDefault) {
      throw new Error(`There is already a default role for hierarchy level ${this.hierarchyLevel}`);
    }
  }
  next();
});


cachingMiddleware(RoleSchema);

export const Role = model<IRole>('Role', RoleSchema);

// Apply Context-Aware Data Isolation (Hybrid: System + Tenant)
RoleSchema.plugin(contextScopePlugin, {
  companyField: 'company',
  includeGlobal: true
});