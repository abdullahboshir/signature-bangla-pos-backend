import type { Request, Response, NextFunction } from "express";
import { ContextService } from "../services/context.service.js";
import type { ScopeLevel } from "../services/context.service.js";

/**
 * Context Middleware
 * Initializes the AsyncLocalStorage context for the entire request lifecycle.
 * This should be the first middleware in the API route group.
 */
export const contextMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Helper to extract from multiple sources
    const extract = (keys: string[]): string | undefined => {
        for (const key of keys) {
            // Check Header
            const headerVal = req.headers[`x-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`] || req.headers[key.toLowerCase()];
            if (headerVal) return Array.isArray(headerVal) ? headerVal[0] : headerVal;

            // Check Query
            if (req.query && req.query[key]) return String(req.query[key]);

            // Check Body
            if (req.body && req.body[key]) return req.body[key];
        }
        return undefined;
    };

    // Resolve IDs
    const companyId = extract(['companyId', 'company']);
    const businessUnitId = extract(['businessUnitId', 'businessUnit']);
    const outletId = extract(['outletId', 'outlet']);

    const context = {
        companyId,
        businessUnitId,
        outletId,
        scopeLevel: 'PLATFORM' as ScopeLevel,
    };

    // Attach to Request for easy access in controllers/middlewares
    (req as any).context = context;

    ContextService.run(context as any, () => {
        next();
    });
};

export default contextMiddleware;
