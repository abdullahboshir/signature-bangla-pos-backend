// schemas/permission.schema.ts
import { z } from 'zod';

export const ResourceTypeSchema = z.enum([
  'product', 'order', 'customer', 'category', 'brand', 'vendor', 
  'supplier', 'promotion', 'content', 'user', 'role', 'payment', 
  'shipping', 'report', 'analytics', 'system', 'inventory', 
  'coupon', 'review', 'return', 'ticket', 'delivery'
]);

export const PermissionActionTypeSchema = z.enum([
  'create', 'read', 'update', 'delete', 'approve', 'reject', 
  'export', 'import', 'manage', 'view', 'ship', 'refund', 
  'dispatch', 'assign'
]);

export const PermissionScopeSchema = z.enum([
  'global', 'vendor', 'category', 'region', 'businessUnit', 
  'team', 'branch', 'warehouse'
]);

export const PermissionEffectSchema = z.enum(['allow', 'deny']);

export const ResolveStrategySchema = z.enum([
  'first-match',
  'most-specific',
  'priority-based',
  'cumulative'
]);

export const ConditionOperatorSchema = z.enum([
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'not-in', 'contains'
]);

export const PermissionConditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: ConditionOperatorSchema,
  value: z.any()
}).refine((data) => {
  // Validate value based on operator
  if (['in', 'not-in'].includes(data.operator)) {
    return Array.isArray(data.value);
  }
  return true;
}, {
  message: "Value must be an array for 'in' and 'not-in' operators"
});

export const PermissionResolverSchema = z.object({
  strategy: ResolveStrategySchema,
  priority: z.number().int().min(0).max(1000).optional().default(0),
  inheritFrom: z.array(z.string().uuid()).optional().default([]),
  override: z.boolean().optional().default(false),
  fallback: PermissionEffectSchema.optional().default('deny')
});

export const PermissionMetadataSchema = z.object({
  category: z.string().optional(),
  module: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
});

export const PermissionSchema = z.object({
  id: z.string().uuid(),
  resource: ResourceTypeSchema,
  action: PermissionActionTypeSchema,
  scope: PermissionScopeSchema,
  effect: PermissionEffectSchema,
  attributes: z.array(z.string()).optional().default([]),
  conditions: z.array(PermissionConditionSchema).optional().default([]),
  resolver: PermissionResolverSchema.optional(),
  description: z.string().min(1, "Description is required").max(500),
  descriptionBangla: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  metadata: PermissionMetadataSchema.optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  createdBy: z.string().min(1, "Created by is required"),
  updatedBy: z.string().min(1, "Updated by is required")
}).refine((data) => {
  // Validate that update date is not before create date
  return data.updatedAt >= data.createdAt;
}, {
  message: "Updated date cannot be before created date",
  path: ["updatedAt"]
});

export const PermissionGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().min(1, "Description is required").max(500),
  permissions: z.array(z.string().uuid()),
  resolver: PermissionResolverSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export const PermissionContextSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    roles: z.array(z.string()),
    businessUnits: z.array(z.string()),
    branches: z.array(z.string()).optional().default([]),
    vendorId: z.string().optional(),
    region: z.string().optional()
  }),
  resource: z.object({
    id: z.string().optional(),
    ownerId: z.string().optional(),
    vendorId: z.string().optional(),
    category: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  environment: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    timeOfDay: z.string().optional()
  }).optional()
});

// Validation for creating new permissions
export const CreatePermissionSchema = PermissionSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).extend({
  id: z.string().uuid().optional()
});

export const UpdatePermissionSchema = CreatePermissionSchema.partial();

// Bulk operation schemas
export const BulkPermissionOperationSchema = z.object({
  operations: z.array(z.object({
    type: z.enum(['create', 'update', 'delete']),
    data: z.any()
  })),
  batchId: z.string().optional()
});