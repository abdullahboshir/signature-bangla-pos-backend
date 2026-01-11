/**
 * Industrial Standard Centralized Audit Middleware
 * 
 * This middleware automatically logs significant API operations
 * (CREATE, UPDATE, DELETE) based on HTTP method and route.
 * 
 * This approach is used by enterprise systems like SAP, Salesforce, and Workday
 * to ensure consistent and comprehensive audit trails without manual code changes.
 */

import type { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service.js";

// Routes to skip (public, health checks, etc.)
const SKIP_ROUTES = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
    '/health',
    '/status',
    '/audit-logs' // Avoid infinite loop
];

// Map HTTP methods to actions
const METHOD_ACTION_MAP: Record<string, string> = {
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE'
};

// Extract resource name from URL path (e.g., /api/v1/users/123 -> users)
function extractResource(path: string): string {
    // 1. Remove leading/trailing slashes and API prefix
    const cleanPath = path.replace(/^\/|\/$/g, '').replace('api/v1/', '');
    const parts = cleanPath.split('/');

    // 2. Skip known namespaces/prefixes that represent context, not resources
    const NAMESPACES = ['super-admin', 'admin', 'platform', 'system'];
    // Note: 'system' might be a module, but often used as prefix. 
    // If 'system' is a resource (e.g. system settings), we need to be careful.
    // For now, let's assume if it's followed by something, that's the resource.

    let resource = parts[0];

    // If first part is a namespace and there is a second part, take the second part
    if (resource && NAMESPACES.includes(resource.toLowerCase()) && parts.length > 1) {
        resource = parts[1];
    }

    // Special handling: 'system/audit-logs' -> AUDIT-LOGS
    if (resource === 'system' && parts[1]) {
        resource = parts[1];
    }

    return resource?.toUpperCase() || 'UNKNOWN';
}

// Extract resource ID if present
function extractResourceId(path: string, body: any): string {
    const parts = path.split('/');
    // Check for ID in path (last segment if it's alphanumeric)
    const lastSegment = parts[parts.length - 1];
    if (lastSegment && /^[a-f0-9]{24}$/i.test(lastSegment)) {
        return lastSegment;
    }
    // Fallback to body _id or id
    return body?._id || body?.id || 'N/A';
}

// Infer module from route
function inferModule(path: string): 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system' {
    const lowerPath = path.toLowerCase();
    if (lowerPath.includes('/pos') || lowerPath.includes('/terminal') || lowerPath.includes('/cash-register')) return 'pos';
    if (lowerPath.includes('/inventory') || lowerPath.includes('/purchase') || lowerPath.includes('/supplier')) return 'erp';
    if (lowerPath.includes('/staff') || lowerPath.includes('/attendance') || lowerPath.includes('/payroll') || lowerPath.includes('/leave')) return 'hrm';
    if (lowerPath.includes('/order') || lowerPath.includes('/product') || lowerPath.includes('/storefront')) return 'ecommerce';
    if (lowerPath.includes('/customer') || lowerPath.includes('/marketing') || lowerPath.includes('/campaign')) return 'crm';
    if (lowerPath.includes('/courier') || lowerPath.includes('/delivery') || lowerPath.includes('/logistics')) return 'logistics';
    return 'system';
}

import { ContextService } from "../services/context.service.js";

// Helper to sanitize payload (remove passwords, tokens, etc.)
function sanitizePayload(body: any): any {
    if (!body) return null;
    const sanitized = { ...body };
    const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'creditCard', 'cvv'];

    Object.keys(sanitized).forEach(key => {
        if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field))) {
            sanitized[key] = '********'; // Mask sensitive data
        } else if (typeof sanitized[key] === 'object') {
            sanitized[key] = sanitizePayload(sanitized[key]); // Recurring sanitization
        }
    });
    return sanitized;
}

import { UAParser } from 'ua-parser-js';

// Resources that should be logged even for GET requests (Sensitivity Level: HIGH)
const SENSITIVE_READ_RESOURCES = [
    'PAYROLL',
    'SALARY',
    'TRANSACTION',
    'AUDIT-LOGS',
    'PERMISSION',
    'ROLE',
    'REPORT',
    'ANALYTICS-REPORT',
    'BANK-ACCOUNT'
];

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    ContextService.run(() => {
        const method = req.method.toUpperCase();
        const resource = extractResource(req.path); // Extract early to check sensitivity

        // Determine if we should log this request
        const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        const isSensitiveRead = method === 'GET' && SENSITIVE_READ_RESOURCES.includes(resource);

        if (!isMutating && !isSensitiveRead) {
            return next();
        }

        // Skip certain routes (health checks, assets, etc.)
        if (SKIP_ROUTES.some(route => req.path.includes(route))) {
            return next();
        }

        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const responseStatus = res.statusCode;

            const user = (req as any).user;
            if (!user || !user.userId) {
                // For sensitive reads, we might want to log unauthenticated attempts too, 
                // but for now let's stick to authenticated users to avoid noise.
                // console.log('⚠️ [AuditMiddleware] Skipped: No authenticated user');
                return;
            }

            const action = `${METHOD_ACTION_MAP[method] || 'UNKNOWN'}_${resource}`;
            const resourceId = extractResourceId(req.path, req.body as Record<string, unknown>);
            const module = inferModule(req.path);

            const businessUnitId = (req.headers['x-business-unit-id'] as string) ||
                (req as any).businessUnitId ||
                user.primaryBusinessUnit?.toString() ||
                'GLOBAL';

            const changes = ContextService.getDiffs();
            const errors = ContextService.getErrors();

            // Parse User Agent
            const detector = new UAParser(req.headers['user-agent']);
            const uaResult = detector.getResult();
            const deviceName = `${uaResult.browser.name || 'Unknown'} on ${uaResult.os.name || 'Unknown'} (${uaResult.device.type || 'Desktop'})`;

            AuditService.log({
                action,
                module,
                actor: {
                    userId: user.userId.toString(),
                    role: Array.isArray(user.role) ? user.role.join(', ') : (user.role || user.roles?.[0]?.name || 'unknown'),
                    ip: req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown'
                },
                target: {
                    resource,
                    resourceId
                },
                businessUnitId,
                requestPayload: isSensitiveRead ? undefined : sanitizePayload(req.body), // Don't log payload for GET (usually empty/query params)
                responseStatus,
                duration,
                changes: changes.length > 0 ? { diffs: changes } : {},
                metadata: {
                    method: req.method,
                    path: req.path,
                    userAgent: req.headers['user-agent'], // Keep raw
                    device: deviceName, // Add parsed
                    errors: errors.length > 0 ? errors : undefined
                }
            });
        });

        next();
    });
};
