import { AsyncLocalStorage } from 'node:async_hooks';
import type { Types } from 'mongoose';
import { SecurityAlert } from '../../app/modules/platform/security/security-alert.model.js';

// ============================================
// CONTEXT LEVELS & POLICY
// ============================================

export type ScopeLevel = 'PLATFORM' | 'ORGANIZATION' | 'BUSINESS_UNIT' | 'OUTLET';

/**
 * Defines what data each scope level can access.
 * - PLATFORM (Super Admin): Can see all levels
 * - ORGANIZATION (Organization Owner): Can see organization and below
 * - BUSINESS_UNIT (Business Admin): Can see BU and outlets
 * - OUTLET (Cashier/Store Manager): Can only see their outlet
 */
export const CONTEXT_POLICY: Record<ScopeLevel, ScopeLevel[]> = {
    PLATFORM: ['ORGANIZATION', 'BUSINESS_UNIT', 'OUTLET'],
    ORGANIZATION: ['ORGANIZATION', 'BUSINESS_UNIT', 'OUTLET'],
    BUSINESS_UNIT: ['BUSINESS_UNIT', 'OUTLET'],
    OUTLET: ['OUTLET'],
};

// ============================================
// CONTEXT INTERFACES
// ============================================

export interface IRequestContext {
    // Hierarchy IDs (populated based on request)
    organizationId?: Types.ObjectId | string;
    companyId?: Types.ObjectId | string; // Backward compatibility
    businessUnitId?: Types.ObjectId | string;
    outletId?: Types.ObjectId | string;
    domain?: string;

    // Current scope level (determines filtering policy)
    scopeLevel: ScopeLevel;

    // User info for audit/permission checks
    userId?: Types.ObjectId | string;
    roleType?: string;

    // ====== TENANT CONTEXT (Hybrid Multi-Tenancy) ======
    tenantDeploymentType?: 'shared' | 'dedicated';
    tenantDatabaseUri?: string;
    tenantIsProvisioned?: boolean;

    // Audit-specific data (backward compatible)
    diffs: Record<string, any>[];
    validationErrors: string[];
    customMetadata: Record<string, any>;
}

// ============================================
// CONTEXT SERVICE (AsyncLocalStorage)
// ============================================

export class ContextService {
    private static storage = new AsyncLocalStorage<IRequestContext>();

    /**
     * Initialize the context for a new request.
     * Call this in middleware at the start of each request.
     */
    static run(context: Partial<IRequestContext>, callback: () => void) {
        const fullContext: IRequestContext = {
            scopeLevel: 'PLATFORM', // Default to platform (super admin)
            diffs: [],
            validationErrors: [],
            customMetadata: {},
            ...context,
        };
        this.storage.run(fullContext, callback);
    }

    /**
     * Get the current request context
     */
    static getContext(): IRequestContext | undefined {
        return this.storage.getStore();
    }

    /**
     * Update context with new values (e.g., after auth resolves user)
     */
    static setContext(updates: Partial<IRequestContext>) {
        const store = this.getContext();
        if (store) {
            Object.assign(store, updates);
        }
    }

    // ============================================
    // FILTER BUILDERS (CORE MULTI-TENANCY LOGIC)
    // ============================================

    /**
     * Build a MongoDB filter based on current context.
     * This is the CORE method that enforces data isolation.
     * 
     * @param options - Configuration for filter building
     * @returns MongoDB filter object
     */
    static buildContextFilter(options: {
        /** If true, requires outlet context (for outlet-scoped data) */
        requireOutlet?: boolean;
        /** If true, requires business unit context */
        requireBusinessUnit?: boolean;
        /** If true, bypasses all context filtering (use sparingly!) */
        bypassContext?: boolean;
        /** Additional filter conditions to merge */
        additionalFilter?: Record<string, any>;
    } = {}): Record<string, any> {
        if (options.bypassContext) {
            return options.additionalFilter || {};
        }

        const ctx = this.getContext();
        if (!ctx) {
            // No context = no data (security by default)
            console.warn('[ContextService] No context found, returning empty filter');
            return { _id: { $exists: false } }; // Returns nothing
        }

        const filter: Record<string, any> = {};
        const allowedLevels = CONTEXT_POLICY[ctx.scopeLevel];

        // Apply filters based on scope policy
        const orgId = ctx.organizationId || ctx.companyId;
        if (orgId && allowedLevels.includes('ORGANIZATION')) {
            filter['organizationId'] = orgId;
        }

        if (ctx.businessUnitId && allowedLevels.includes('BUSINESS_UNIT')) {
            filter['businessUnitId'] = ctx.businessUnitId;
        }

        if (ctx.outletId && allowedLevels.includes('OUTLET')) {
            filter['outletId'] = ctx.outletId;
        }

        // Enforce required scopes
        if (options.requireOutlet && !ctx.outletId) {
            console.warn('[ContextService] Outlet required but not in context');
            return { _id: { $exists: false } };
        }

        if (options.requireBusinessUnit && !ctx.businessUnitId) {
            console.warn('[ContextService] BusinessUnit required but not in context');
            return { _id: { $exists: false } };
        }

        return { ...filter, ...options.additionalFilter };
    }

    /**
     * Get context values to stamp on new documents when saving.
     * Ensures new records inherit the correct hierarchy.
     */
    static getContextStamp(): Record<string, any> {
        const ctx = this.getContext();
        if (!ctx) return {};

        const stamp: Record<string, any> = {};
        const orgId = ctx.organizationId || ctx.companyId;
        if (orgId) {
            stamp['organizationId'] = orgId;
            stamp['companyId'] = orgId; // Backward compatibility for field name
        }
        if (ctx.businessUnitId) stamp['businessUnitId'] = ctx.businessUnitId;
        if (ctx.outletId) stamp['outletId'] = ctx.outletId;
        if (ctx['domain']) stamp['domain'] = ctx['domain'];

        return stamp;
    }

    // ============================================
    // AUDIT HELPERS (Backward Compatible)
    // ============================================

    /** @deprecated Use getContext() instead */
    static getStore(): IRequestContext | undefined {
        return this.getContext();
    }

    static addDiff(diff: Record<string, any>) {
        const store = this.getContext();
        if (store) {
            store.diffs.push(diff);
        }
    }

    static addError(error: string) {
        const store = this.getContext();
        if (store) {
            store.validationErrors.push(error);
        }
    }

    static getDiffs() {
        return this.getContext()?.diffs || [];
    }

    static getErrors() {
        return this.getContext()?.validationErrors || [];
    }

    /**
     * Validates that the provided ID(s) belong to the current company context.
     * Prevents cross-tenant referential hijacking (Phase 8).
     */
    static async validateReferentialIntegrity(
        model: any,
        ids: string | string[] | Types.ObjectId | Types.ObjectId[],
        fieldName: string = '_id'
    ): Promise<void> {
        const ctx = this.getContext();
        if (!ctx || ctx.scopeLevel === 'PLATFORM') return; // Platform can see everything

        const normalizedIds = Array.isArray(ids) ? ids : [ids];
        if (normalizedIds.length === 0) return;

        const orgId = ctx.organizationId || ctx.companyId;

        const count = await model.countDocuments({
            [fieldName]: { $in: normalizedIds },
            $or: [
                { organizationId: orgId },
                { companyId: orgId }
            ]
        });

        if (count !== normalizedIds.length) {
            this.logSecurityAlert({
                type: 'CONTEXT_HIJACKING',
                severity: 'CRITICAL',
                action: 'REFERENTIAL_FAIL',
                details: `Referential Integrity Failure in ${model.modelName}. Expected ${normalizedIds.length} records, found ${count} in context.`
            });
            throw new Error(`[ContextService] Security Breach: One or more referenced records in ${model.modelName} do not belong to your organization.`);
        }
    }

    /**
     * Logs a security alert for suspicious context-related activity.
     * (Master Checklist Item 6: Suspicious Access Attempts)
     */
    static async logSecurityAlert(options: {
        type: 'UNAUTHORIZED_READ' | 'UNAUTHORIZED_WRITE' | 'CONTEXT_HIJACKING' | 'INVALID_ONBOARDING';
        severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        collectionName?: string | null | undefined;
        action: string;
        details: string;
        request?: any;
    }) {
        const ctx = this.getContext();
        const req = options.request;

        try {
            await SecurityAlert.create({
                type: options.type,
                severity: options.severity,
                collectionName: options.collectionName,
                action: options.action,
                details: options.details,
                context: {
                    userId: ctx?.userId,
                    organizationId: ctx?.organizationId || ctx?.companyId,
                    companyId: ctx?.companyId || ctx?.organizationId,
                    businessUnitId: ctx?.businessUnitId,
                    outletId: ctx?.outletId,
                    ip: req?.ip,
                    userAgent: req?.get?.('user-agent'),
                    path: req?.originalUrl
                }
            });
        } catch (error) {
            console.error('[ContextService] Failed to log security alert:', error);
        }
    }
}

