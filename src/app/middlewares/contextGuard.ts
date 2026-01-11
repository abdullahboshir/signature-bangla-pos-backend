import type { Request, Response, NextFunction } from "express";
import status from "http-status";
import AppError from "@shared/errors/app-error.ts";
import mongoose from "mongoose";

/**
 * contextGuard
 * The Ultimate Context Shield for the 4-level hierarchy.
 * 
 * Validates ownership of Business Unit and Outlet IDs/Slugs across:
 * 1. Path Parameters (req.params)
 * 2. Request Body (req.body)
 * 
 * Ensures that even if a user has "Product:Create" permission, they can only
 * create a product for a Business Unit they actually belong to.
 */
export const contextGuard = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = (req as any).user;

        if (!user) {
            return next(new AppError(status.UNAUTHORIZED, "Authentication required for context validation"));
        }

        // 🛡️ Super Admins bypass all context checks (Global access)
        if (user.roleName?.includes('super-admin') || user.isSuperAdmin) {
            return next();
        }

        // --- 1. COLLECT CONTEXTS FROM REQUEST ---
        // We look for any field that implies a BU or Outlet context
        const businessUnitContext =
            req.params?.['businessUnitId'] ||
            req.params?.['businessUnit'] ||
            req.body?.['businessUnit'] ||
            req.body?.['businessUnitId'];

        const outletContext =
            req.params?.['outletId'] ||
            req.params?.['outlet'] ||
            req.body?.['outlet'] ||
            req.body?.['outletId'];

        // --- 2. VALIDATE BUSINESS UNIT ACCESS ---
        if (businessUnitContext) {
            const allowedBUs = user.businessUnits || [];
            const isObjectId = mongoose.Types.ObjectId.isValid(businessUnitContext);
            const contextStr = businessUnitContext.toString();

            const hasAccess = allowedBUs.some((bu: any) => {
                const buId = bu._id?.toString() || bu.id?.toString() || bu.toString();
                const buSlug = bu.slug;

                if (isObjectId) {
                    return buId === contextStr;
                } else {
                    return buSlug === contextStr;
                }
            });

            if (!hasAccess) {
                return next(new AppError(status.FORBIDDEN, `Context Security Error: You do not have access to Business Unit [${contextStr}]`));
            }
        }

        // --- 3. VALIDATE OUTLET ACCESS ---
        if (outletContext) {
            const allowedOutlets = user.outlets || [];
            const contextStr = outletContext.toString();

            const hasAccess = allowedOutlets.some((o: any) => {
                const oId = o._id?.toString() || o.id?.toString() || o.toString();
                return oId === contextStr;
            });

            if (!hasAccess) {
                return next(new AppError(status.FORBIDDEN, `Context Security Error: You do not have access to Outlet [${contextStr}]`));
            }
        }

        next();
    };
};

export default contextGuard;
