
import status from 'http-status';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import { permissionGroupService } from './permission-group.service.js';

// Get all permission groups
export const getAllPermissionGroups = catchAsync(async (req, res) => {
    const result = await permissionGroupService.getAllGroups(req.query);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: 'Permission groups retrieved successfully',
        data: result,
    });
});

// Get single permission group
export const getPermissionGroupById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await permissionGroupService.getGroupById(id as string);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: 'Permission group retrieved successfully',
        data: result,
    });
});

// Create permission group
export const createPermissionGroup = catchAsync(async (req, res) => {
    const result = await permissionGroupService.createGroup(req.body);

    ApiResponse.success(res, {
        statusCode: status.CREATED,
        success: true,
        message: 'Permission group created successfully',
        data: result,
    });
});

// Update permission group
export const updatePermissionGroup = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await permissionGroupService.updateGroup(id as string, req.body);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: 'Permission group updated successfully',
        data: result,
    });
});

// Delete permission group
export const deletePermissionGroup = catchAsync(async (req, res) => {
    const { id } = req.params;
    await permissionGroupService.deleteGroup(id as string);

    ApiResponse.success(res, {
        statusCode: status.OK,
        success: true,
        message: 'Permission group deleted successfully',
    });
});
