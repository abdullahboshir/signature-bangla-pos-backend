import type { Request, Response } from 'express';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import status from 'http-status';
import { CompanySettingsService } from './settings.service.ts';
import AppError from '@shared/errors/app-error.ts';

const getSettings = catchAsync(async (req: Request, res: Response) => {
    const companyId = req.params['companyId'] as string;
    if (!companyId) throw new AppError(status.BAD_REQUEST, 'Company ID is required');

    const result = await CompanySettingsService.getSettings(companyId);
    ApiResponse.success(res, result, 'Company settings retrieved', status.OK);
});

const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const companyId = req.params['companyId'] as string;
    if (!companyId) throw new AppError(status.BAD_REQUEST, 'Company ID is required');

    const result = await CompanySettingsService.updateSettings(companyId, req.body);
    ApiResponse.success(res, result, 'Company settings updated', status.OK);
});

export const CompanySettingsController = {
    getSettings,
    updateSettings
};
