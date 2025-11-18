import { model, Schema, Types } from "mongoose";
import type { IRole } from "./role.interface.js";
import { cachingMiddleware } from "../../utils/cacheQuery.js";
import { bumpVersion } from "../../utils/cacheKeys.js";


const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
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
    permissions:  [{type: Types.ObjectId, ref: "Permission", required: true}],
    permissionGroups:  [{type: Types.ObjectId, ref: "PermissionGroup", required: true}],
    inheritedRoles: [{
      type: Types.ObjectId,
      ref: 'Role',
      validate: {
        validator: function(this: IRole, roles: Types.ObjectId[]) {
          // Prevent circular inheritance
          return !roles.includes(this._id as unknown as Types.ObjectId);
        },
        message: 'Role cannot inherit from itself'
      }
    }],
    isSystemRole: {
      type: Boolean,
      default: false
    },
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
      max: [10, 'Hierarchy level cannot exceed 10'],
      default: 1
    },
    maxDataAccess: {
      products: { type: Number, min: 0 },
      orders: { type: Number, min: 0 },
      customers: { type: Number, min: 0 }
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


RoleSchema.virtual('allPermissions').get(function(this: IRole) {
  return this.permissions;
});

RoleSchema.pre('save', async function(next) {
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

// Invalidate permission caches by bumping role version on changes
RoleSchema.post('save', async function() {
  await bumpVersion('role');
});
RoleSchema.post('findOneAndUpdate', async function() {
  await bumpVersion('role');
});
RoleSchema.post('deleteOne', { document: false, query: true }, async function() {
  await bumpVersion('role');
});
RoleSchema.post('deleteMany', async function() {
  await bumpVersion('role');
});

export const Role = model<IRole>('Role', RoleSchema);