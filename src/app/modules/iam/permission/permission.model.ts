import mongoose, { Schema } from "mongoose";
import type { IPermission } from "./permission.interface.js";
import {
  PermissionActionType,
  PermissionEffect,
  PermissionResourceType,
  PermissionScope,
  PermissionResolveStrategy,
  PermissionConditionOperator,
  PermissionModule
} from "./permission.resource.js";

// Condition Schema
const PermissionConditionSchema = new Schema(
  {
    field: {
      type: String,
      required: true,
    },
    operator: {
      type: String,
      required: true,
      enum: PermissionConditionOperator,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const PermissionResolverSchema = new Schema(
  {
    strategy: {
      type: String,
      required: true,
      enum: PermissionResolveStrategy,
    },
    priority: {
      type: Number,
      default: 0,
    },
    inheritFrom: [
      {
        type: String,
      },
    ],
    override: {
      type: Boolean,
      default: false,
    },
    fallback: {
      type: String,
      enum: ["allow", "deny"],
      default: "deny",
    },
  },
  { _id: false }
);

// Metadata Schema
const PermissionMetadataSchema = new Schema(
  {
    category: { type: String },
    module: { type: String },
    version: { type: String, default: "1.0.0" },
    tags: [{ type: String }],
  },
  { _id: false }
);

// Main Permission Schema
const PermissionSchema = new Schema<IPermission>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    // Top-level module categorization for faster lookups
    module: {
      type: String,
      enum: [...PermissionModule],
      required: true,
      index: true
    },
    resource: {
      type: String,
      required: true,
      enum: PermissionResourceType,
    },
    action: {
      type: String,
      required: true,
      enum: PermissionActionType,
    },
    scope: {
      type: String,
      required: true,
      enum: PermissionScope,
    },
    effect: {
      type: String,
      required: true,
      enum: PermissionEffect,
      default: "allow",
    },
    attributes: [
      {
        type: String,
      },
    ],
    conditions: [PermissionConditionSchema],
    resolver: PermissionResolverSchema,
    description: {
      type: String,
      required: true,
    },
    descriptionBangla: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: PermissionMetadataSchema,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ scope: 1, effect: 1 });
PermissionSchema.index({ isActive: 1 });
PermissionSchema.index({ createdAt: -1 });
PermissionSchema.index({ "metadata.category": 1 });

export const Permission = mongoose.model<IPermission>(
  "Permission",
  PermissionSchema
);
