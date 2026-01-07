import type { Request, Response } from 'express';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import status from 'http-status';
import { OutletSettingsService } from './settings.service.ts';
import AppError from '@shared/errors/app-error.ts';

const getSettings = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'] as string;
    if (!outletId) throw new AppError(status.BAD_REQUEST, 'Outlet ID is required');

    const result = await OutletSettingsService.getSettings(outletId);
    ApiResponse.success(res, result, 'Outlet settings retrieved', status.OK);
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const outletId = req.params['outletId'] as string;
    if (!outletId) throw new AppError(status.BAD_REQUEST, 'Outlet ID is required');

    const result = await OutletSettingsService.updateSettings(outletId, req.body);
    ApiResponse.success(res, result, 'Outlet settings updated', status.OK);
});

export const OutletSettingsController = {
    getSettings,
    updateSettings
};
