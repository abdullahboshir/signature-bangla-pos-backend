import type { Request, Response } from 'express';
import catchAsync from '../../../../core/utils/catchAsync.js';
import { ApiResponse } from '../../../../core/utils/api-response.js';
import httpStatus from 'http-status';
import { LicenseService } from './license.service.ts';

const createLicense = catchAsync(async (req: Request, res: Response) => {
    // Assign creator
    const creator = req.user?.['id'] || req.user?.['_id'];
    const payload = { ...req.body, createdBy: creator };

    const result = await LicenseService.createLicense(payload);
    ApiResponse.success(res, result, 'License generated successfully', httpStatus.CREATED);
});

const getAllLicenses = catchAsync(async (_req: Request, res: Response) => {
    const result = await LicenseService.getAllLicenses();
    ApiResponse.success(res, result, 'Licenses retrieved successfully', httpStatus.OK);
});

const validateLicense = catchAsync(async (req: Request, res: Response) => {
    // Validate by key query param or body
    const key = req.body['key'] || req.query['key'];
    if (!key) {
        throw new Error("License key is required");
    }
    const result = await LicenseService.getLicenseByKey(key as string);

    // Check Date
    if (result.expiresAt && new Date() > new Date(result.expiresAt)) {
        res.status(400).json({ success: false, message: 'License Expired' });
        return;
    }
    if (result.status !== 'active') {
        res.status(400).json({ success: false, message: `License is ${result.status}` });
        return;
    }

    ApiResponse.success(res, result, 'License is valid', httpStatus.OK);
});

const revokeLicense = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await LicenseService.revokeLicense(id);
    ApiResponse.success(res, result, 'License revoked successfully', httpStatus.OK);
});


export const LicenseController = {
    createLicense,
    getAllLicenses,
    validateLicense,
    revokeLicense
};
