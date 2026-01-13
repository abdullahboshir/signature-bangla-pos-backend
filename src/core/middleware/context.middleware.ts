import type { Request, Response, NextFunction } from "express";
import { ContextService } from "../services/context.service.js";
import type { ScopeLevel } from "../services/context.service.js";

/**
 * Context Middleware
 * Initializes the AsyncLocalStorage context for the entire request lifecycle.
 * This should be the first middleware in the API route group.
 */
export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Initial context with values from headers if available
    // These will be refined/overwritten by the auth middleware
    const initialContext = {
        companyId: req.headers['x-company-id'] as string,
        businessUnitId: req.headers['x-business-unit-id'] as string,
        outletId: req.headers['x-outlet-id'] as string,
        scopeLevel: 'PLATFORM' as ScopeLevel, // Default to platform until auth refines it
    };

    ContextService.run(initialContext, () => {
        next();
    });
};

export default contextMiddleware;
