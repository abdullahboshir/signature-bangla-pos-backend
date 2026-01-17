import type { Request, Response } from 'express';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import status from 'http-status';
import { OrganizationSettingsService } from './settings.service.js';
import AppError from '@shared/errors/app-error.ts';

const getSettings = catchAsync(async (req: Request, res: Response) => {
    const organizationId = req.params['organizationId'] as string;
    if (!organizationId) throw new AppError(status.BAD_REQUEST, 'Organization ID is required');

    const result = await OrganizationSettingsService.getSettings(organizationId);
    ApiResponse.success(res, result, 'Organization settings retrieved', status.OK);
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const organizationId = req.params['organizationId'] as string;
    if (!organizationId) throw new AppError(status.BAD_REQUEST, 'Organization ID is required');

    const result = await OrganizationSettingsService.updateSettings(organizationId, req.body);
    ApiResponse.success(res, result, 'Organization settings updated', status.OK);
});

export const OrganizationSettingsController = {
    getSettings,
    updateSettings
};
