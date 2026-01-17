
import type { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '@shared/errors/app-error.ts';
import catchAsync from '@core/utils/catchAsync.ts';

/**
 * Middleware to enforce module licensing.
 * Checks if the user's organization has the required module enabled in `activeModules`.
 * Requires `auth` middleware to run first to populate `req.user.organizationModules`.
 * 
 * @param moduleName The key of the module to check (e.g., 'pos', 'hrm', 'erp')
 */
const requireModule = (moduleName: string) => {
    return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
        // 1. Get User Context
        const user = req.user as any;
        if (!user) {
            throw new AppError(status.UNAUTHORIZED, 'Authentication required for module check');
        }

        // 2. Identify Organization Context
        // Strategy: 
        // A. If header `x-organization-id` or `x-company-id` is present, check that organization.
        // B. If header `x-business-unit-id` is present, resolve organization from user's businessAccess.
        // C. If neither, check ALL user's organizations (strict mode) OR fail (context required).

        const contextOrganizationId = (req.headers['x-organization-id'] || req.headers['x-company-id']) as string;
        const contextBusinessUnitId = req.headers['x-business-unit-id'] as string;

        let targetOrganizationId = contextOrganizationId;

        // Verify if BU implies an organization
        if (!targetOrganizationId && contextBusinessUnitId && user.businessUnits) {
            // Context resolution logic is primarily handled in auth.ts
            // We rely on req.user.organizations or specific target header
        }

        if (user.roleName && (user.roleName.includes('super-admin') || user.isSuperAdmin)) {
            return next();
        }

        const organizationModules = user.organizationModules || user.companyModules || {};

        // If we know the target organization, check it specifically
        if (targetOrganizationId) {
            const config = organizationModules[targetOrganizationId];
            if (!config || !config[moduleName]) {
                throw new AppError(status.FORBIDDEN, `License Required: ${moduleName.toUpperCase()} module is not enabled for this organization.`);
            }
            return next();
        }

        // So: Check if *any* accessible organization has the module enabled.
        const hasLicense = Object.values(organizationModules).some((modules: any) => modules[moduleName] === true);

        if (!hasLicense) {
            throw new AppError(status.FORBIDDEN, `License Required: You do not have access to any organization with ${moduleName.toUpperCase()} enabled.`);
        }

        next();
    });
};

export default requireModule;
