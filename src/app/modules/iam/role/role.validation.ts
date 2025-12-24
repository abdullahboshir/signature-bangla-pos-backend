// validations/role.validation.ts
import { z } from 'zod';
import mongoose from 'mongoose';

const permissionSchema = z.object({
  resource: z.enum([
    'product', 'order', 'customer', 'category', 'brand', 'vendor',
    'supplier', 'promotion', 'content', 'user', 'role', 'payment',
    'shipping', 'report', 'analytics', 'system', 'inventory', 'coupon',
    'review', 'return', 'ticket', 'delivery'
  ]),
  action: z.enum([
    'create', 'read', 'update', 'delete', 'approve', 'reject', 'export',
    'import', 'manage', 'view', 'ship', 'refund', 'dispatch', 'assign'
  ]),
  scope: z.enum([
    'global', 'vendor', 'category', 'region', 'businessUnit', 'team',
    'branch', 'warehouse'
  ]),
  attributes: z.array(z.string().trim()).optional(),
  conditions: z.record(z.string(), z.any()).optional(),
  description: z.string().trim().min(1).max(500),
  descriptionBangla: z.string().trim().max(500).optional()
});

export const createRoleValidation = z.object({
  body: z.object({
    name: z.string()
      .trim()
      .min(1, 'Role name is required')
      .max(100, 'Role name cannot exceed 100 characters')
      .regex(/^[a-zA-Z0-9_-\s]+$/, 'Role name can only contain letters, numbers, spaces, hyphens and underscores'),

    nameBangla: z.string()
      .trim()
      .max(100, 'Bangla role name cannot exceed 100 characters')
      .optional(),

    description: z.string()
      .trim()
      .min(1, 'Role description is required')
      .max(500, 'Description cannot exceed 500 characters'),

    descriptionBangla: z.string()
      .trim()
      .max(500, 'Bangla description cannot exceed 500 characters')
      .optional(),

    permissions: z.array(z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)))
      .optional()
      .default([]),

    inheritedRoles: z.array(
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid role ID format'
      })
    ).optional(),

    permissionGroups: z.array(z.string()).optional(),

    isSystemRole: z.boolean().default(false),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),

    hierarchyLevel: z.number()
      .int('Hierarchy level must be an integer')
      .min(1, 'Hierarchy level must be at least 1')
      .max(10, 'Hierarchy level cannot exceed 10')
      .default(1),

    maxDataAccess: z.object({
      products: z.number().int().min(0).optional(),
      orders: z.number().int().min(0).optional(),
      customers: z.number().int().min(0).optional()
    }).optional(),

    // createdBy is handled by service from token, not body
    createdBy: z.string().optional()
  })
});

export const updateRoleValidation = z.object({
  body: createRoleValidation.shape.body.partial()
});

export type RoleInput = z.infer<typeof createRoleValidation>['body'];