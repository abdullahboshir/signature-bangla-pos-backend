// src/modules/Permission/permission.controller.ts
import {type Request, type Response } from 'express';
import status from 'http-status';
import { z } from 'zod';

import catchAsync from '../../utils/catchAsync.js';
import sendResponse, { type MetaData } from '../../utils/sendResponse.js';
import AppError from '../../errors/AppError.js';


import { Permission } from './permission.model.js';
import { User } from '../user/user.model.js';
import { permissionService } from './permission.service.js';
import { buildContextFromRequest } from './permission.utils.js';

/* -------------------------------------------------------------------------- */
/* 1️⃣  Validation schemas (zod)                                            */
/* -------------------------------------------------------------------------- */
const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

const permissionFilterSchema = z.object({
  resource: z.string().optional(),
  action:   z.string().optional(),
  scope:    z.string().optional(),
  isActive: z.string().optional(),                     // "true" | "false"
});

const checkPermissionBodySchema = z.object({
  resource: z.string().min(1),
  action:   z.string().min(1),
});

/* -------------------------------------------------------------------------- */
/* 2️⃣  Helper – parse boolean & pagination                                 */
/* -------------------------------------------------------------------------- */
function parseBoolean(v: any): boolean | undefined {
  if (v === undefined) return undefined;
  if (typeof v === 'boolean') return v;
  const lowered = String(v).toLowerCase();
  if (['true', '1', 'yes'].includes(lowered)) return true;
  if (['false', '0', 'no'].includes(lowered)) return false;
  return undefined;
}

/* -------------------------------------------------------------------------- */
/* 3️⃣  Controllers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * GET /permissions
 */
export const getAllPermissions = catchAsync(
  async (req: Request, res: Response) => {
    /* --------- validation & parsing --------- */
    const { page = '1', limit = '20' } = paginationSchema.parse(req.query);
    const { resource, action, scope, isActive } = permissionFilterSchema.parse(req.query);

    const filter: any = {};
    if (resource) filter.resource = resource;
    if (action)   filter.action   = action;
    if (scope)    filter.scope    = scope;
    const boolActive = parseBoolean(isActive);
    if (boolActive !== undefined) filter.isActive = boolActive;

    const pg = Math.max(1, Number(page));
    const lt = Math.max(1, Number(limit));
    const skip = (pg - 1) * lt;

    /* --------- DB query --------- */
    const [permissions, total] = await Promise.all([
      Permission.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ resource: 1, action: 1 })
        .skip(skip)
        .limit(lt)
        .lean(),
      Permission.countDocuments(filter),
    ]);

    /* --------- Response --------- */
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Permissions retrieved successfully',
      data: permissions,
      meta: {
        total,
        page: pg,
        limit: lt,
        totalPages: Math.ceil(total / lt),
      } as MetaData,
    });
  }
);

/**
 * GET /permissions/:id
 */
export const getPermissionById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new AppError(status.BAD_REQUEST, 'Permission id is required');

    const permission = await Permission.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean();

    if (!permission) {
      throw new AppError(status.NOT_FOUND, `Permission ${id} not found`);
    }

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'Permission retrieved successfully',
      data: permission,
    });
  }
);

/**
 * GET /users/:userId/permissions
 * – ক্যাশ‑ড রেজলভড পারমিশন, রোল‑ইনহেরিট‑ডিপথ ও গ্রুপ‑বাই‑রিসোর্স
 */
export const getUserPermissions = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new AppError(status.BAD_REQUEST, 'User id is required');

    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: [
          { path: 'permissions' },
          { path: 'permissionGroups', populate: { path: 'permissions' } },
          { path: 'inheritedRoles' },
        ],
      })
      .populate('directPermissions')            // <-- ensure direct perms are loaded
      .lean();

    if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

    const permissions = await permissionService.getUserPermissions(user as any);

    // ------- group by resource ---------
    const grouped = permissions.reduce<Record<string, any[]>>((acc, perm) => {
      (acc[perm.resource] ??= []).push(perm);
      return acc;
    }, {});

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: 'User permissions retrieved successfully',
      data: {
        userId: user.id,
        email: user.email,
        roles: (user.roles as any[]).map((r) => ({
          id: r._id,
          name: r.name,
          description: r.description,
        })),
        totalPermissions: permissions.length,
        permissionsByResource: grouped,
        allPermissions: permissions,
      },
    });
  }
);

/**
 * POST /permissions/check
 * – রিকোয়েস্ট‑বডি: { resource, action }
 */
export const checkUserPermission = catchAsync(
  async (req: Request, res: Response) => {
    const { resource, action } = checkPermissionBodySchema.parse(req.body);

    // authentication‑middleware‑কে ধরেছি যে `req.user` একটি object
    const userId = (req.user as any)?.userId ?? (req.user as any)?.id;
    if (!userId) throw new AppError(status.UNAUTHORIZED, 'User id missing in token');

    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: [
          { path: 'permissions' },
          { path: 'permissionGroups', populate: { path: 'permissions' } },
          { path: 'inheritedRoles' },
        ],
      })
      .populate('directPermissions')
      .lean();

    if (!user) throw new AppError(status.NOT_FOUND, 'User not found');

    const context = buildContextFromRequest(req);

    const result = await permissionService.checkPermission(
      user as any,
      resource,
      action,
      context
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: result.allowed ? 'Permission granted' : 'Permission denied',
      data: {
        resource,
        action,
        allowed: result.allowed,
        reason: result.reason,
        permission: result.permission
          ? {
              id: result.permission.id,
              description: result.permission.description,
              scope: result.permission.scope,
              effect: result.permission.effect,
            }
          : null,
        resolvedBy: result.resolvedBy,
      },
    });
  }
);
