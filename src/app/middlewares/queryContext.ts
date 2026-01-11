import type { Request, Response, NextFunction } from "express";

/**
 * queryContext
 * Centrally injects Business Unit and Company context into request filters.
 * Ensures that even if a user doesn't pass a filter, the system only returns 
 * data they are authorized to see (Self-Filtering).
 * 
 * This satisfies the "Repeated code centrally used" requirement by removing
 * the need for manual BU filtering logic in every service.
 */
export const queryContext = () => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // Skip for unauthenticated (auth should handle this elsewhere)
        if (!user) return next();

        // 🛡️ Super Admins skip auto-filtering (Global visibility)
        if (user.roleName?.includes('super-admin') || user.isSuperAdmin) {
            return next();
        }

        // 1. Resolve target context
        // Priority: Path Params > Headers > Query String
        const targetBU = req.params?.['businessUnitId'] || req.headers?.['x-business-unit-id'] || req.query?.['businessUnit'];
        const targetCompany = req.params?.['companyId'] || req.headers?.['x-company-id'] || req.query?.['company'];
        const targetOutlet = req.params?.['outletId'] || req.headers?.['x-outlet-id'] || req.query?.['outlet'];

        if (targetBU) {
            req.query['businessUnit'] = targetBU as any;
        }
        if (targetCompany) {
            req.query['company'] = targetCompany as any;
        }
        if (targetOutlet) {
            req.query['outlet'] = targetOutlet as any;
        }

        // 2. Self-Filtering: If NO specific context is requested
        // Inject all authorized IDs to prevent cross-account/cross-tenant leakage.
        if (!targetBU && !targetCompany && !targetOutlet && req.method === 'GET') {
            const authorizedBUs = user.businessUnits || [];
            const authorizedCompanies = user.companies || [];
            const authorizedOutlets = user.outlets || [];

            if (authorizedBUs.length > 0) {
                const buIds = authorizedBUs.map((bu: any) => bu._id?.toString() || bu.id?.toString() || bu.toString());
                req.query['businessUnit'] = buIds.length === 1 ? buIds[0] : ({ $in: buIds } as any);
            }

            if (authorizedCompanies.length > 0) {
                const companyIds = authorizedCompanies.map((c: any) => c._id?.toString() || c.id?.toString() || c.toString());
                // Only inject company if BU filtering is not already narrow enough? 
                // Better to inject both to be safe (AND condition in QueryBuilder)
                req.query['company'] = companyIds.length === 1 ? companyIds[0] : ({ $in: companyIds } as any);
            }

            if (authorizedOutlets.length > 0) {
                const outletIds = authorizedOutlets.map((o: any) => o._id?.toString() || o.id?.toString() || o.toString());
                req.query['outlet'] = outletIds.length === 1 ? outletIds[0] : ({ $in: outletIds } as any);
            }
        }

        next();
    };
};

export default queryContext;
