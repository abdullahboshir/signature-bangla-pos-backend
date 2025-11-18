// users.validation.ts
import { z } from 'zod';
import { USER_STATUS_ARRAY } from './user.constant.js';

// Address Schema
const addressSchema = z.object({
  country: z.string().default('Bangladesh'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  subDistrict: z.string().min(1, 'Sub-district is required'),
  alliance: z.string().optional(),
  village: z.string().optional(),
  type: z.enum(['home', 'work', 'other']),
  street: z.string().min(1, 'Street is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  isDefault: z.boolean().default(false)
});

// Working Hours Schema
const workingHoursSchema = z.object({
  start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  timezone: z.string().default('Asia/Dhaka')
});

// Restrictions Schema
const restrictionsSchema = z.object({
  maxDiscountPercentage: z.number().min(0).max(100).optional(),
  allowedCategories: z.array(z.string().uuid()).optional(),
  allowedVendors: z.array(z.string().uuid()).optional(),
  workingHours: workingHoursSchema.optional()
});

// Permission Schema
const permissionSchema = z.object({
  resource: z.enum(['product', 'order', 'customer', 'category', 'brand', 'vendor', 'supplier', 'promotion', 'content', 'user', 'role', 'payment', 'shipping', 'report', 'analytics', 'system']),
  action: z.enum(['create', 'read', 'update', 'delete', 'approve', 'reject', 'export', 'import', 'manage', 'view', 'process']),
  scope: z.enum(['global', 'vendor', 'category', 'region', 'department']).default('global'),
  attributes: z.array(z.string()).optional(),
  conditions: z.record(z.string(), z.any()).optional(),
  description: z.string().optional(),
  descriptionBangla: z.string().optional()
});

// Login History Schema
const loginHistorySchema = z.object({
  date: z.date().default(() => new Date()),
  ip: z.string().regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    'Invalid IP address'
  ),
  userAgent: z.string()
});

// Base User Schema
const baseUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  firstNameBangla: z.string().max(50).optional(),
  lastNameBangla: z.string().max(50).optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number').optional(),
  role: z.string().uuid('Invalid role ID'),
  status: z.enum(USER_STATUS_ARRAY as [string, ...string[]]).default('active'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  addresses: z.array(addressSchema).min(1, 'At least one address is required'),
  region: z.string().optional(),
  directPermissions: z.array(permissionSchema).optional(),
  restrictions: restrictionsSchema.optional(),
  isActive: z.boolean().default(true)
});

// Create User Schema
export const createUserSchema = baseUserSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
});

// Update User Schema
export const updateUserSchema = baseUserSchema.partial().extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .optional()
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
});

// Update Profile Schema
export const updateProfileSchema = baseUserSchema.partial();

// Response Schema
export const userResponseSchema = baseUserSchema.extend({
  id: z.string(),
  isEmailVerified: z.boolean(),
  isPhoneVerified: z.boolean(),
  needsPasswordChange: z.boolean(),
  passwordChangedAt: z.date().optional(),
  isDeleted: z.boolean(),
  lastLogin: z.date().optional(),
  loginHistory: z.array(loginHistorySchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().uuid().optional(),
  updatedBy: z.string().uuid().optional()
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;