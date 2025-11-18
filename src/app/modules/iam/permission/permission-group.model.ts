// modules/permission/permissionGroup.model.ts
import mongoose, { Schema } from 'mongoose';
import type { IPermissionGroup } from './permission.interface.js';

const PermissionGroupSchema = new Schema<IPermissionGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission',
    required: true
  }],
  resolver: {
    strategy: {
      type: String,
      required: true,
      enum: ["first-match", "most-specific", "priority-based", "cumulative"]
    },
    priority: { type: Number, default: 0 },
    inheritFrom: [{ type: String }],
    override: { type: Boolean, default: false },
    fallback: { 
      type: String, 
      enum: ["allow", "deny"],
      default: "deny"
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
PermissionGroupSchema.index({ isActive: 1 });
PermissionGroupSchema.index({ "resolver.strategy": 1 });

// ✅ Proper model registration
export const PermissionGroup = mongoose.model<IPermissionGroup>('PermissionGroup', PermissionGroupSchema);