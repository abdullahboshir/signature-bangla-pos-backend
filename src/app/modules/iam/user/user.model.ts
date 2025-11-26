import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import type { IUser, UserStatic } from "./user.interface.js";
import { USER_STATUS } from "./user.constant.js";
import { cachingMiddleware } from "@core/utils/cacheQuery.ts";




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

// Working Hours Schema
const WorkingHoursSchema = new Schema({
  start: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  end: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC'
  }
}, { _id: false });

// Restrictions Schema
const RestrictionsSchema = new Schema({
  maxDiscountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  allowedCategories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  workingHours: WorkingHoursSchema
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
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  }],
  departments: [{
    type: String,
    required: true
  }],
  branches: [{
    type: String
  }],
  vendorId: {
    type: String
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
  isDeleted: {
    type: Boolean,
    default: false
  },
  directPermissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  restrictions: {
    type: RestrictionsSchema
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
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(_doc, ret: any ) {
      delete ret?.password;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ roles: 1 });
UserSchema.index({ departments: 1 });
UserSchema.index({ branches: 1 });
UserSchema.index({ vendorId: 1 });
UserSchema.index({ region: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isDeleted: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'name.firstName': 1, 'name.lastName': 1 });

// Virtual for fullName
UserSchema.virtual('fullName').get(function() {
  if (this["name"]) {
    return `${this["name"].firstName} ${this["name"].lastName}`.trim();
  }
  return '';
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
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
UserSchema.pre('save', function(next) {
  if (!this["isModified"]('password') || this["isNew"]) return next();
  
  this["passwordChangedAt"] = new Date(Date.now() - 1000); // 1 second ago
  next();
});

// Static method: Check if user exists by email
UserSchema.statics["isUserExists"] = async function(email: string): Promise<IUser> {
  const user = await this["findOne"]({ email, isDeleted: false, isActive: true }).populate('roles')
    .select('+password');
  
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
};

// Static method: Check if password matches (instance method alternative)
UserSchema.statics["isPasswordMatched"] = async function(
  plainText: string, 
  hashedPass: string
): Promise<boolean> {
  return await bcrypt.compare(plainText, hashedPass);
};

// Static method: Check if JWT was issued before password change
UserSchema.statics["isJWTIssuedBeforePasswordChanged"] = function(
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
UserSchema.methods["isPasswordMatched"] = async function(plainText: string): Promise<boolean> {
  return await bcrypt.compare(plainText, this["password"]);
};

// Instance method: Check if user needs password change
UserSchema.methods["changedPasswordAfter"] = function(JWTTimestamp: number): boolean {
  if (this["passwordChangedAt"]) {
    const changedTimestamp = Math.floor(this["passwordChangedAt"].getTime() / 1000);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Virtual for active roles
UserSchema.virtual('activeRoles', {
  ref: 'Role',
  localField: 'roles',
  foreignField: '_id',
  match: { isActive: true, isDeleted: false }
});

// Query middleware to exclude deleted users
UserSchema.pre(/^find/, function(next) {
  (this as any).where({ isDeleted: false });
  next();
});

// Method to add login history
UserSchema.methods["addLoginHistory"] = function(ip: string, userAgent: string) {
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
UserSchema.methods["getPermissionsSummary"] = async function() {
  await this["populate"]({
    path: 'roles',
    populate: {
      path: 'permissionGroup',
      populate: {
        path: 'permissions'
      }
    }
  });
  
  const allPermissions = [];
  const permissionMap = new Map();
  
  // Collect permissions from roles
  for (const role of this["roles"]) {
    for (const group of role.permissionGroups) {
      for (const permission of group.permissions) {
        if (!permissionMap.has(permission.id)) {
          permissionMap.set(permission.id, permission);
          allPermissions.push(permission);
        }
      }
    }
  }
  
  // Add direct permissions
  if (this["directPermissions"] && this["directPermissions"].length > 0) {
    for (const permission of this["directPermissions"]) {
      if (!permissionMap.has(permission.id)) {
        permissionMap.set(permission.id, permission);
        allPermissions.push(permission);
      }
    }
  }
  
  return {
    totalPermissions: allPermissions.length,
    allowedPermissions: allPermissions.filter(p => p.effect === 'allow').length,
    deniedPermissions: allPermissions.filter(p => p.effect === 'deny').length,
    resources: [...new Set(allPermissions.map(p => p.resource))],
    permissions: allPermissions
  };
};

 cachingMiddleware(UserSchema);

export const User = model<IUser, UserStatic>('User', UserSchema);