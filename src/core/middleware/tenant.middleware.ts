/**
 * ============================================================================
 * TENANT MIDDLEWARE - Request-Level Tenant Context Injection
 * ============================================================================
 * Early-stage middleware that resolves tenant context from the request
 * and injects it into AsyncLocalStorage for downstream use.
 * 
 * This should be one of the first middlewares in the chain (after body-parser).
 */

import type { Request, Response, NextFunction } from 'express';

import { ConnectionManager } from '@core/database/mongoose/connection-manager.ts';
import logger from '@core/utils/logger.ts';
import { TenantService, type ITenantContext } from '@core/services/tenant.service.ts';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            tenant?: ITenantContext | null;
            tenantConnection?: import('mongoose').Connection;
        }
    }
}

/**
 * Tenant Resolution Middleware.
 * Resolves tenant from Host header, subdomain, or x-organization-id.
 */
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract possible tenant identifiers
        const host = req.get('host') || req.hostname;
        const orgIdHeader = (req.headers['x-organization-id'] || req.headers['x-company-id']) as string | undefined;
        const orgSlugHeader = req.headers['x-organization-slug'] as string | undefined;

        // Resolve tenant
        const tenant = await TenantService.resolveTenant({
            host,
            organizationId: orgIdHeader,
            organizationSlug: orgSlugHeader
        });

        // Attach tenant context to request
        req.tenant = tenant;

        // If dedicated tenant, get the appropriate database connection
        if (tenant && TenantService.isDedicated(tenant)) {
            try {
                const connection = await ConnectionManager.getConnection(
                    tenant.organizationId,
                    tenant.databaseUri!
                );
                req.tenantConnection = connection;
                logger.debug(`[TENANT] Using dedicated connection for: ${tenant.organizationSlug}`);
            } catch (error) {
                logger.error(`[TENANT] Failed to get dedicated connection:`, error);
                // Fallback to shared database (graceful degradation)
                req.tenantConnection = ConnectionManager.getDefaultConnection();
            }
        } else {
            // Shared tenant uses default connection
            req.tenantConnection = ConnectionManager.getDefaultConnection();
        }

        next();
    } catch (error) {
        logger.error('[TENANT] Middleware error:', error);
        // Don't block request on tenant resolution failure
        req.tenant = null;
        req.tenantConnection = ConnectionManager.getDefaultConnection();
        next();
    }
};

/**
 * Require Tenant Middleware.
 * Use this on routes that MUST have a valid tenant context.
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
        return res.status(400).json({
            success: false,
            message: 'Tenant context required. Please provide x-organization-id header or use a valid subdomain.',
            code: 'TENANT_REQUIRED'
        });
    }
    next();
};

/**
 * Require Dedicated Tenant Middleware.
 * Use this on routes that are only available for dedicated deployment tenants.
 */
export const requireDedicatedTenant = (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant || !TenantService.isDedicated(req.tenant)) {
        return res.status(403).json({
            success: false,
            message: 'This feature is only available for dedicated deployment plans.',
            code: 'DEDICATED_REQUIRED'
        });
    }
    next();
};

export default tenantMiddleware;
