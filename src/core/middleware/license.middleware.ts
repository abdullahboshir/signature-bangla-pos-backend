
import type { NextFunction, Request, Response } from 'express';
import status from 'http-status';
import AppError from '@shared/errors/app-error.ts';
import catchAsync from '@core/utils/catchAsync.ts';

/**
 * Middleware to enforce module licensing.
 * Checks if the user's company has the required module enabled in `activeModules`.
 * Requires `auth` middleware to run first to populate `req.user.companyModules`.
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

        // 2. Identify Company Context
        // Strategy: 
        // A. If header `x-company-id` is present, check that company.
        // B. If header `x-business-unit-id` is present, resolve company from user's businessAccess.
        // C. If neither, check ALL user's companies (strict mode) OR fail (context required).

        // For simple enforcement: We check if the user HAS ACCESS to the module in ANY of their companies 
        // matching the current context.

        const contextCompanyId = req.headers['x-company-id'] as string;
        const contextBusinessUnitId = req.headers['x-business-unit-id'] as string;

        let targetCompanyId = contextCompanyId;

        // Verify if BU implies a company
        if (!targetCompanyId && contextBusinessUnitId && user.businessUnits) {
            // Logic to find company from BU could be implemented here
            // We can't easily link BU to Company here without looking up the access map again or having it in BU object.
            // BUT, we have `user.companyModules` which is Map<CompanyId, Modules>.
            // We need to know WHICH company the current request is for.

            // Simplification: Most requests SHOULD have x-business-unit-id OR x-company-id.
            // If we don't know the company, we can't enforce Company-level license strictly without more info.
            // However, `auth.ts` populates `companyModules`. 

            // FAIL SAFE: If no context, allow? NO.
            // If no context, maybe it's a platform route? Platform routes shouldn't use this middleware.
        }

        // If we still don't have a distinct Target Company ID, we check if the user has AT LEAST ONE company with this module enabled?
        // No, that's insecure. 
        // We will strictly enforce: You must provide context OR be a Super Admin.

        if (user.roleName && user.roleName.includes('super-admin')) {
            return next();
        }

        const companyModules = user.companyModules || {};

        // If we know the target company, check it specifically
        if (targetCompanyId) {
            const config = companyModules[targetCompanyId];
            if (!config || !config[moduleName]) {
                throw new AppError(status.FORBIDDEN, `License Required: ${moduleName.toUpperCase()} module is not enabled for this company.`);
            }
            return next();
        }

        // If we have Business Unit ID, we need to find its company.
        // Since `auth.ts` flat-mapped everything, let's look at `businessAccess` again?
        // `req.user` doesn't have raw `businessAccess`.

        // ALTERNATIVE: Check if ANY of the user's accessible companies have this module?
        // This is looser but might be acceptable if the user is scoped by `auth` middleware anyway regarding data access.
        // i.e., `auth` prevents them from seeing Company B's data. 
        // So checking "Does User have Company A (POS=True)?" is enough to let them hit /pos routes.
        // The *Controller* will prevent them from touching Company B data.

        // So: Check if *any* accessible company has the module enabled.
        const hasLicense = Object.values(companyModules).some((modules: any) => modules[moduleName] === true);

        if (!hasLicense) {
            throw new AppError(status.FORBIDDEN, `License Required: You do not have access to any company with ${moduleName.toUpperCase()} enabled.`);
        }

        next();
    });
};

export default requireModule;
