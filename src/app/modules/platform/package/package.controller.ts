import type { Request, Response } from 'express';

import httpStatus from 'http-status';
import { PackageService } from './package.service.ts';
import catchAsync from '../../../../core/utils/catchAsync.js';
import { ApiResponse } from '../../../../core/utils/api-response.js';

const createPackage = catchAsync(async (req: Request, res: Response) => {
    if (!req.body) {
        throw new Error("Request body is empty or undefined");
    }
    const result = await PackageService.createPackage(req.body);
    ApiResponse.success(res, result, 'Package created successfully', httpStatus.CREATED);
});

const getAllPackages = catchAsync(async (_req: Request, res: Response) => {
    const result = await PackageService.getAllPackages();
    ApiResponse.success(res, result, 'Packages retrieved successfully', httpStatus.OK);
});

const getPackageById = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await PackageService.getPackageById(id);
    ApiResponse.success(res, result, 'Package retrieved successfully', httpStatus.OK);
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await PackageService.updatePackage(id, req.body);
    ApiResponse.success(res, result, 'Package updated successfully', httpStatus.OK);
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const result = await PackageService.deletePackage(id);
    ApiResponse.success(res, result, 'Package deleted successfully', httpStatus.OK);
});

export const PackageController = {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage,
};
