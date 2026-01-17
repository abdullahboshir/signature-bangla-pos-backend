import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import type { IUser, UserStatic } from "./user.interface.js";
import { USER_STATUS } from "./user.constant.js";
import { auditDiffPlugin } from '../../../../core/plugins/mongoose-diff.plugin.js';
import { cachingMiddleware } from "@core/utils/cacheQuery.ts";
import { contextScopePlugin } from "@core/plugins/context-scope.plugin.js";





const NameSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  }
}, { _id: false });

// Login History Schema
const LoginHistorySchema = new Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  }
}, { _id: false });



// Main User Schema
const UserSchema = new Schema<IUser, UserStatic>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  name: {
    type: NameSchema,
    required: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    sparse: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Default exclude from queries
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  globalRoles: {
    type: [Schema.Types.ObjectId],
    ref: "Role",
    default: []
  },
  region: {
    type: String
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(USER_STATUS),
    default: USER_STATUS.PENDING
  },
  avatar: {
    type: String
  },
  needsPasswordChange: {
    type: Boolean,
    default: false
  },
  passwordChangedAt: {
    type: Date
  },
  setupPasswordToken: {
    type: String,
    sparse: true
  },
  setupPasswordExpires: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  directPermissions: [{
    _id: false,
    permissionId: {
      type: Schema.Types.ObjectId,
      ref: 'Permission',
      required: true
    },
    type: {
      type: String,
      enum: ['allow', 'deny'],
      required: true
    },
    source: {
      type: String,
      enum: ['DIRECT', 'GROUP', 'INHERITED', 'SYSTEM', 'POLICY'],
      default: 'DIRECT'
    },
    assignedScope: {
      type: String,
      enum: ['GLOBAL', 'COMPANY', 'BUSINESS', 'OUTLET'],
      required: true
    }
  }],

  settings: {
    theme: { type: String, default: 'system' },
    tableHeight: { type: String, default: '56' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [LoginHistorySchema],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (_doc, ret: any) {
      delete ret?.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ 'globalRoles': 1 }); // Main Access Lookup for Global Roles
UserSchema.index({ vendorId: 1 });
UserSchema.index({ region: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ setupPasswordToken: 1 }, { sparse: true });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'name.firstName': 1, 'name.lastName': 1 });

// Virtual for fullName
UserSchema.virtual('fullName').get(function (this: IUser) {
  if (this.name) {
    return `${this.name.firstName} ${this.name.lastName}`.trim();
  }
  return '';
});

// Virtual for businessAccess (Separate Collection)
UserSchema.virtual('businessAccess', {
  ref: 'UserBusinessAccess',
  localField: '_id',
  foreignField: 'user'
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function (next) {
  if (!this["isModified"]('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this["password"] = await bcrypt.hash(this["password"], salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Pre-save middleware for passwordChangedAt
UserSchema.pre('save', function (next) {
  const doc = this as any;
  if (!doc.isModified('password') || doc.isNew) return next();

  doc.passwordChangedAt = new Date(Date.now() - 1000); // 1 second ago
  next();
});

// Static method: Check if user exists by email
// Assuming IUser and UserSchema are defined and imported
// Note: 'this' inside a static method refers to the Model.

UserSchema.statics["isUserExists"] = async function (email: string): Promise<IUser> {
  const query = this["findOne"]({ email, isDeleted: false, isActive: true });
  (query as any)._bypassContext = true;
  const user = await query
    .populate([
      {
        path: 'globalRoles',
        populate: [
          { path: 'permissions', model: 'Permission', select: 'resource action scope effect conditions resolver attributes' }, // Direct permissions
          {
            path: 'permissionGroups',
            model: 'PermissionGroup',
            select: 'permissions resolver',
            populate: { path: 'permissions', model: 'Permission', select: 'resource action scope effect conditions resolver attributes' }
          }
        ]
      },
      // Direct Permissions Population
      {
        path: 'directPermissions.permissionId',
        model: 'Permission',
        select: 'resource action scope effect conditions resolver attributes'
      },
      {
        path: 'businessAccess',
        select: 'role scope company businessUnit outlet status isPrimary dataScopeOverride',
        populate: [
          {
            path: 'role',
            select: 'name title permissionGroups',
            populate: {
              path: 'permissionGroups',
              select: 'permissions resolver',
              populate: { path: 'permissions', model: 'Permission', select: 'resource action scope effect conditions resolver attributes' }
            }
          },
          { path: 'company', select: 'name id activeModules' },
          { path: 'businessUnit', select: 'name slug id' },
          { path: 'outlet', select: 'name' }
        ]
      }
    ])
    .select('+password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

// Static method: Check if password matches (instance method alternative)
UserSchema.statics["isPasswordMatched"] = async function (
  plainText: string,
  hashedPass: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPass);
};

// Static method: Check if JWT was issued before password change
UserSchema.statics["isJWTIssuedBeforePasswordChanged"] = function (
  passwordChangedAtTime: Date,
  jwtIssuedTime: number
): boolean {
  if (passwordChangedAtTime) {
    const changedTimestamp = Math.floor(passwordChangedAtTime.getTime() / 1000);
    return jwtIssuedTime < changedTimestamp;
  }
  return false;
};

// Instance method: Check if password matches (alternative approach)
UserSchema.methods["isPasswordMatched"] = async function (this: any, plainText: string): Promise<boolean> {
  return await bcrypt.compare(plainText, this.password);
};

// Instance method: Check if user needs password change
UserSchema.methods["changedPasswordAfter"] = function (JWTTimestamp: number): boolean {
  if (this["passwordChangedAt"]) {
    const changedTimestamp = Math.floor(this["passwordChangedAt"].getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};



// Query middleware to exclude deleted users
UserSchema.pre(/^find/, function (next) {
  (this as any).where({ isDeleted: false });
  next();
});

// Method to add login history
UserSchema.methods["addLoginHistory"] = function (ip: string, userAgent: string) {
  this["loginHistory"].push({
    date: new Date(),
    ip,
    userAgent
  });

  // Keep only last 10 login records
  if (this["loginHistory"].length > 10) {
    this["loginHistory"] = this["loginHistory"].slice(-10);
  }

  this["lastLogin"] = new Date();
  return this["save"]();
};

// Method to get user permissions summary
UserSchema.methods["getPermissionsSummary"] = async function () {
  await this["populate"]({
    path: 'globalRoles',
    populate: {
      path: 'permissionGroups',
      populate: {
        path: 'permissions'
      }
    }
  });

  const allPermissions = [];
  const permissionMap = new Map();

  // Collect permissions from globalRoles
  if (this["globalRoles"]) {
    for (const role of this["globalRoles"]) {
      // Check if role is populated and has permissionGroups
      if (role && (role as any).permissionGroups) {
        for (const group of (role as any).permissionGroups) {
          if (group.permissions) {
            for (const permission of group.permissions) {
              if (!permissionMap.has(permission.id)) {
                permissionMap.set(permission.id, permission);
                allPermissions.push(permission);
              }
            }
          }
        }
      }
    }
  }

  // Add direct permissions
  if (this["directPermissions"] && this["directPermissions"].length > 0) {
    for (const dp of this["directPermissions"]) {
      // Fetch permission details if not populated? 
      // Ideally, directPermissions.permissionId should be populated before calling this.
      // But for summary, we assume caller might not have populated deeply. 
      // For safety, we check if permissionId is an object (populated) or logic needs fetching.
      // NOTE: For 'summary' method, we usually expect population. 

      // Assuming permissionId is populated or available in permissionMap if we fetched all?
      // Re-using logic: access the detailed permission object.
      // If it's just ID, we can't get resource/action details without fetch.

      const p: any = dp.permissionId;

      if (p && p.resource) { // Check if populated
        if (dp.type === 'allow') {
          if (!permissionMap.has(p.id)) {
            permissionMap.set(p.id, p);
            allPermissions.push(p);
          }
        } else if (dp.type === 'deny') {
          // Remove if exists (Deny overrides Allow)
          if (permissionMap.has(p.id)) {
            permissionMap.delete(p.id);
            const idx = allPermissions.findIndex(ap => ap.id === p.id);
            if (idx !== -1) allPermissions.splice(idx, 1);
          }
        }
      }
    }
  }

  return {
    totalPermissions: allPermissions.length,
    resources: [...new Set(allPermissions.map(p => p.resource))],
    permissions: allPermissions
  };
};

cachingMiddleware(UserSchema);

// Apply Audit Diff Plugin
(UserSchema as any).plugin(auditDiffPlugin);

// Apply Context-Aware Data Isolation
UserSchema.plugin(contextScopePlugin, {
  companyField: 'company',
  includeGlobal: true
});

export const User = model<IUser, UserStatic>('User', UserSchema);