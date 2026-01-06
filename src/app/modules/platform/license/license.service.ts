import { License } from './license.model.ts';
import type { ILicense } from './license.interface.ts';
import AppError from '../../../../shared/errors/app-error.js';
import httpStatus from 'http-status';
import crypto from 'crypto';

const generateLicenseKey = (): string => {
    // Format: XXXX-XXXX-XXXX-XXXX
    return crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || 'KEY-ERROR';
};

import { Types } from 'mongoose';
import BusinessUnit from '../organization/business-unit/core/business-unit.model.ts';


const createLicense = async (payload: Partial<ILicense>) => {
    // Resolve Client ID (Slug to ObjectId)
    if (payload.clientId) {
        const isObjectId = Types.ObjectId.isValid(payload.clientId.toString());
        if (!isObjectId) {
            const businessUnit = await BusinessUnit.findOne({ slug: payload.clientId });
            if (!businessUnit) {
                throw new AppError(httpStatus.NOT_FOUND, `Business Unit with slug '${payload.clientId}' not found`);
            }
            payload.clientId = businessUnit._id;
            payload.clientName = businessUnit.name;
        } else if (!payload.clientName) {
            const businessUnit = await BusinessUnit.findById(payload.clientId);
            if (businessUnit) {
                payload.clientName = businessUnit.name;
            }
        }
    }

    // Generate Key
    payload.key = generateLicenseKey();
    payload.activationDate = new Date();

    // Default expiry (e.g. 1 year) if not provided? Or keep null for lifetime.
    // Logic can be extended based on Package type logic.

    const result = await License.create(payload);
    return result;
};

const getAllLicenses = async () => {
    const result = await License.find().populate('packageId');
    return result;
};

const getLicenseByKey = async (key: string) => {
    const result = await License.findOne({ key }).populate('packageId');
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'License not found');
    return result;
};

const revokeLicense = async (id: string) => {
    const result = await License.findByIdAndUpdate(id, { status: 'revoked' }, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'License not found');
    return result;
};

const updateLicense = async (id: string, payload: Partial<ILicense>) => {
    // Prevent key update safely
    delete payload.key;

    // Resolve Client ID if changed (Optional)
    if (payload.clientId) {
        // Logic similar to create can be reused or simplified
        const isObjectId = Types.ObjectId.isValid(payload.clientId.toString());
        if (!isObjectId) {
            const businessUnit = await BusinessUnit.findOne({ slug: payload.clientId });
            if (businessUnit) {
                payload.clientId = businessUnit._id;
                payload.clientName = businessUnit.name;
            }
        }
    }

    const result = await License.findByIdAndUpdate(id, payload, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'License not found');
    return result;
};

export const LicenseService = {
    createLicense,
    getAllLicenses,
    getLicenseByKey,
    updateLicense,
    revokeLicense
};
