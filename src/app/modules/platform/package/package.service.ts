import { Package } from './package.model.ts';
import type { IPackage } from './package.interface.ts';
import AppError from '../../../../shared/errors/app-error.js';
import httpStatus from 'http-status';

const createPackage = async (payload: IPackage) => {
    // Generate slug from name if not provided (Safety check)
    if (payload && !payload.slug && payload.name) {
        payload.slug = payload.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    const result = await Package.create(payload);
    return result;
};

const getAllPackages = async () => {
    const result = await Package.find({ isActive: true });
    return result;
};

const getPackageById = async (id: string) => {
    const result = await Package.findById(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    return result;
};

const updatePackage = async (id: string, payload: Partial<IPackage>) => {
    const result = await Package.findByIdAndUpdate(id, payload, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    return result;
};

const deletePackage = async (id: string) => {
    const result = await Package.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'Package not found');
    return result;
};

export const PackageService = {
    createPackage,
    getAllPackages,
    getPackageById,
    updatePackage,
    deletePackage,
};
