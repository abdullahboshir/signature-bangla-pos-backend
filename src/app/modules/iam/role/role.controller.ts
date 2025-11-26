
import status from 'http-status';
import { roleService } from './role.service.js';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';

// Get all roles
export const getAllRoles = catchAsync(async (req, res) => {
  const result = await roleService.getAllRoles(req.query);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Roles retrieved successfully',
    data: result,
  });
});

// Get single role
export const getRoleById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await roleService.getRoleById(id as string);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Role retrieved successfully',
    data: result,
  });
});

// Create role
export const createRole = catchAsync(async (req, res) => {
  const result = await roleService.createRole(req.body, req.user);

  ApiResponse.success(res, {
    statusCode: status.CREATED,
    success: true,
    message: 'Role created successfully',
    data: result,
  });
});

// Update role
export const updateRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await roleService.updateRole(id as string, req.body, req.user);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Role updated successfully',
    data: result,
  });
});

// Delete role
export const deleteRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  await roleService.deleteRole(id as string);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Role deleted successfully',
    data: null,
  });
});

// Assign permissions to role
export const assignPermissionsToRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  
  const result = await roleService.assignPermissions(id as string, permissionIds, req.user);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Permissions assigned successfully',
    data: result,
  });
});

// Remove permissions from role
export const removePermissionsFromRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;
  
  const result = await roleService.removePermissions(id as string, permissionIds, req.user);

  ApiResponse.success(res, {
    statusCode: status.OK,
    success: true,
    message: 'Permissions removed successfully',
    data: result,
  });
});
