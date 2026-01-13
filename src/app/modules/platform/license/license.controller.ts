import type { Request, Response } from 'express';
import catchAsync from '../../../../core/utils/catchAsync.js';
import { ApiResponse } from '../../../../core/utils/api-response.js';
import httpStatus from 'http-status';
import AppError from '@shared/errors/app-error.ts';
import { LicenseService } from './license.service.ts';

const createLicense = catchAsync(async (req: Request, res: Response) => {
    // Assign creator
    const creator = req.user?.['_id'] || req.user?.['userId']; // Prioritize ObjectId or standard userId claim
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
        throw new AppError(httpStatus.BAD_REQUEST, 'License Expired', 'LICENSE_EXPIRED');
    }
    if (result.status !== 'active') {
        throw new AppError(httpStatus.BAD_REQUEST, `License is ${result.status}`, 'LICENSE_INACTIVE');
    }

    ApiResponse.success(res, result, 'License is valid', httpStatus.OK);
});

const revokeLicense = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await LicenseService.revokeLicense(id);
    ApiResponse.success(res, result, 'License revoked successfully', httpStatus.OK);
});


const updateLicense = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await LicenseService.updateLicense(id, req.body);
    ApiResponse.success(res, result, 'License updated successfully', httpStatus.OK);
});

const calculatePrice = catchAsync(async (req: Request, res: Response) => {
    const { packageId, customModules, overriddenLimits } = req.body;
    if (!packageId) {
        throw new AppError(httpStatus.BAD_REQUEST, "packageId is required for pricing preview");
    }
    const result = await LicenseService.calculateLicensePricing(packageId, customModules, overriddenLimits);
    ApiResponse.success(res, result, 'Price calculated successfully', httpStatus.OK);
});

export const LicenseController = {
    createLicense,
    getAllLicenses,
    validateLicense,
    revokeLicense,
    updateLicense,
    calculatePrice
};
