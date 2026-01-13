import { Schema, Document } from 'mongoose';
import type { CallbackError } from 'mongoose';
import { ContextService } from '../services/context.service.js';

// ============================================
// PLUGIN OPTIONS
// ============================================

export interface ContextScopePluginOptions {
    /** 
     * If true, this model requires outlet context for all queries.
     * Use for outlet-specific data like POS transactions.
     */
    requireOutlet?: boolean;

    /**
     * If true, this model requires business unit context.
     * Use for BU-scoped data like products, inventory.
     */
    requireBusinessUnit?: boolean;

    /**
     * If true, this model will NEVER apply context filtering.
     * Use for platform-level models like Permission, Role.
     */
    isGlobalModel?: boolean;

    /**
     * Field name for company reference (default: 'companyId')
     */
    companyField?: string;

    /**
     * Field name for business unit reference (default: 'businessUnitId')
     */
    businessUnitField?: string;

    /**
     * Field name for outlet reference (default: 'outletId')
     */
    outletField?: string;

    /**
     * Field name for domain reference (default: 'domain')
     */
    domainField?: string;

    /**
     * If true, queries will include records where context fields are null (Global/System records).
     * Useful for Roles, Products (templates), etc.
     */
    includeGlobal?: boolean;
}

const DEFAULT_OPTIONS: ContextScopePluginOptions = {
    requireOutlet: false,
    requireBusinessUnit: false,
    isGlobalModel: false,
    companyField: 'companyId',
    businessUnitField: 'businessUnitId',
    outletField: 'outletId',
    domainField: 'domain',
    includeGlobal: false,
};

// ============================================
// CONTEXT SCOPE PLUGIN
// ============================================

/**
 * Mongoose plugin that automatically applies context-based filtering to queries.
 * This is the CORE of multi-tenancy data isolation.
 * 
 * @example
 * // For business-scoped models (products, orders, etc.)
 * schema.plugin(contextScopePlugin);
 * 
 * @example
 * // For outlet-specific models (POS transactions)
 * schema.plugin(contextScopePlugin, { requireOutlet: true });
 * 
 * @example
 * // For global/platform models (permissions, roles)
 * schema.plugin(contextScopePlugin, { isGlobalModel: true });
 */
export const contextScopePlugin = (schema: Schema<any, any, any, any, any>, options: ContextScopePluginOptions = {}) => {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Skip if this is a global model
    if (opts.isGlobalModel) {
        return;
    }

    // ============================================
    // READ HOOKS (Auto-filter on queries)
    // ============================================

    const applyContextFilter = function (this: any, next: (err?: CallbackError) => void) {
        // 🔓 BYPASS: Allow explicit bypass for system/auth queries (Phase 8 Hardening)
        if (this._bypassContext) {
            return next();
        }

        const ctx = ContextService.getContext();

        if (!ctx) {
            // 🛡️ READ GUARD: Zero Trust (Master Checklist Phase 2)
            if (process.env['NODE_ENV'] === 'production') {
                ContextService.logSecurityAlert({
                    type: 'UNAUTHORIZED_READ',
                    severity: 'HIGH',
                    collectionName: schema.get('collection'),
                    action: 'READ',
                    details: 'Attempted to query without request context. Access Denied.'
                });
                return next(new Error(`[ContextScopePlugin] CRITICAL: Attempted to query ${schema.get('collection')} without request context. Access Denied.`));
            }
            // Return empty set for non-production environments to prevent data leaks (Item 6)
            this.where({ _id: { $exists: false } });
            return next();
        }

        // Build filter based on context
        const contextFilter = ContextService.buildContextFilter({
            requireOutlet: opts.requireOutlet ?? false,
            requireBusinessUnit: opts.requireBusinessUnit ?? false,
        });

        // Apply filter with field name mapping
        const filter: Record<string, any> = {};

        if (contextFilter['companyId']) {
            const companyVal = contextFilter['companyId'];
            filter[opts.companyField!] = opts.includeGlobal ? { $in: [companyVal, null] } : companyVal;
        }
        if (contextFilter['businessUnitId']) {
            const buVal = contextFilter['businessUnitId'];
            filter[opts.businessUnitField!] = opts.includeGlobal ? { $in: [buVal, null] } : buVal;
        }
        if (contextFilter['outletId']) {
            const outletVal = contextFilter['outletId'];
            filter[opts.outletField!] = opts.includeGlobal ? { $in: [outletVal, null] } : outletVal;
        }

        // 🧬 DOMAIN ISOLATION: Pharmacy vs Grocery, etc. (Industrial Standard)
        const schemaObj = schema.obj as Record<string, any>;
        if (ctx.domain && schemaObj[opts.domainField!]) {
            filter[opts.domainField!] = ctx.domain;
        }

        // Merge with existing query conditions
        this.where(filter);
        next();
    };

    // Apply to all find operations
    schema.pre('find', applyContextFilter);
    schema.pre('findOne', applyContextFilter);
    schema.pre('findOneAndUpdate', applyContextFilter);
    schema.pre('findOneAndDelete', applyContextFilter);
    schema.pre('countDocuments', applyContextFilter);

    // ============================================
    // AGGREGATE HOOK (Auto-filter on aggregations)
    // ============================================

    schema.pre('aggregate', function (this: any, next) {
        // 🔓 BYPASS: Allow explicit bypass for system/auth aggregations
        if (this._bypassContext) {
            return next();
        }

        const ctx = ContextService.getContext();
        if (!ctx) {
            // 🛡️ AGGREGATE GUARD: Zero Trust (Master Checklist Phase 6)
            if (process.env['NODE_ENV'] === 'production') {
                ContextService.logSecurityAlert({
                    type: 'UNAUTHORIZED_READ',
                    severity: 'HIGH',
                    collectionName: schema.get('collection'),
                    action: 'AGGREGATE',
                    details: 'Attempted to aggregate without request context. Access Denied.'
                });
                return next(new Error(`[ContextScopePlugin] CRITICAL: Attempted to aggregate ${schema.get('collection')} without request context. Access Denied.`));
            }
            // Block data in non-production
            this.pipeline().unshift({ $match: { _id: { $exists: false } } });
            return next();
        }

        const contextFilter = ContextService.buildContextFilter({
            requireOutlet: opts.requireOutlet ?? false,
            requireBusinessUnit: opts.requireBusinessUnit ?? false,
        });

        // Apply field name mapping to filter
        const filter: Record<string, any> = {};
        if (contextFilter['companyId']) filter[opts.companyField!] = contextFilter['companyId'];
        if (contextFilter['businessUnitId']) filter[opts.businessUnitField!] = contextFilter['businessUnitId'];
        if (contextFilter['outletId']) filter[opts.outletField!] = contextFilter['outletId'];

        // 🧬 DOMAIN ISOLATION: Pharmacy vs Grocery, etc. (Industrial Standard)
        const schemaObj = schema.obj as Record<string, any>;
        if (ctx.domain && schemaObj[opts.domainField!]) {
            filter[opts.domainField!] = ctx.domain;
        }

        // Inject $match at the beginning of the pipeline
        this.pipeline().unshift({ $match: filter });
        next();
    });

    // ============================================
    // WRITE HOOKS (Auto-stamp on save)
    // ============================================

    schema.pre('save', function (next: (err?: CallbackError) => void) {
        const doc = this as Document;
        const ctx = ContextService.getContext();

        // 🛡️ WRITE GUARD: Absolute Data Integrity
        if (!ctx) {
            // Check if we are in an environment where context might be missing (like seeding)
            // But for production-critical write operations, we should enforce context.
            if (process.env['NODE_ENV'] === 'production') {
                return next(new Error(`[ContextScopePlugin] CRITICAL: Attempted to save ${schema.get('collection')} without request context. Access Denied.`));
            }
            return next();
        }

        const stamp = ContextService.getContextStamp();
        const schemaObj = schema.obj as Record<string, any>;

        // 1. STAMP: Auto-populate & Enforce tenant IDs
        // "Strict Context Mode": If not PLATFORM scope, we FORCE overwrite to prevent spoofing.
        const isPlatformUser = ctx.scopeLevel === 'PLATFORM';

        const enforceStamping = (fieldOpt: string, contextKey: string) => {
            const fieldName = (opts as any)[fieldOpt];
            const contextVal = (stamp as any)[contextKey];

            if (contextVal && schemaObj[fieldName]) {
                // If Platform user, only fill if missing (allow them to set manual IDs)
                // If Tenant user, FORCE overwrite (prevent spoofing)
                if (!isPlatformUser || !(doc as any)[fieldName]) {
                    (doc as any)[fieldName] = contextVal;
                }
            }
        };

        enforceStamping('companyField', 'companyId');
        enforceStamping('businessUnitField', 'businessUnitId');
        enforceStamping('outletField', 'outletId');
        enforceStamping('domainField', 'domain');

        // 2. VALIDATE: Ensure the document level matches the user's scope policy
        // (Prevent a BU-level user from saving a record into another BU by manually providing ID)

        if (doc.isNew) {
            if (opts.requireOutlet && !stamp['outletId']) {
                return next(new Error(`[ContextScopePlugin] Validation Error: Outlet-scoped model requires outlet context`));
            }
            if (opts.requireBusinessUnit && !stamp['businessUnitId']) {
                return next(new Error(`[ContextScopePlugin] Validation Error: BusinessUnit-scoped model requires BU context`));
            }
        }

        // 3. GLOBAL PROTECTION: Prevent tenants from modifying platform records (Phase 8)
        if (!doc.isNew && ctx.scopeLevel !== 'PLATFORM') {
            const isGlobal = !(doc as any)[opts.companyField!] && !(doc as any)[opts.businessUnitField!] && !(doc as any)[opts.outletField!];
            if (isGlobal) {
                ContextService.logSecurityAlert({
                    type: 'UNAUTHORIZED_WRITE',
                    severity: 'HIGH',
                    collectionName: schema.get('collection'),
                    action: 'WRITE_GLOBAL',
                    details: 'Tenant attempted to modify a global/platform record. Operation Aborted.'
                });
                return next(new Error(`[ContextScopePlugin] CRITICAL: You are not authorized to modify global platform records.`));
            }
        }

        next();
    });

    // ============================================
    // UPDATE HOOKS (Prevent cross-context updates)
    // ============================================

    schema.pre('updateOne', applyContextFilter);
    schema.pre('updateMany', applyContextFilter);
    schema.pre('deleteOne', applyContextFilter);
    schema.pre('deleteMany', applyContextFilter);

    // ============================================
    // BULK HOOKS (Auto-stamp on insertMany)
    // ============================================

    schema.pre('insertMany', function (next, docs) {
        const ctx = ContextService.getContext();
        // Validation during insertMany should be strict in production
        if (!ctx) {
            // 🔐 WRITE GUARD: Industrial Lockdown (Master Checklist Phase 3)
            if (process.env['NODE_ENV'] === 'production') {
                ContextService.logSecurityAlert({
                    type: 'UNAUTHORIZED_WRITE',
                    severity: 'CRITICAL',
                    collectionName: schema.get('collection'),
                    action: 'WRITE_BULK',
                    details: 'Attempted to write bulk documents without request context. Operation Aborted.'
                });
                return next(new Error(`[ContextScopePlugin] CRITICAL: Attempted to write to ${schema.get('collection')} without request context.`));
            }
            return next();
        }

        const stamp = ContextService.getContextStamp();
        const schemaObj = schema.obj as Record<string, any>;

        const isPlatformUser = ctx.scopeLevel === 'PLATFORM';

        for (const doc of docs) {
            // Stamp & Enforce
            const enforceBulkStamping = (fieldOpt: string, contextKey: string) => {
                const fieldName = (opts as any)[fieldOpt];
                const contextVal = (stamp as any)[contextKey];

                if (contextVal && schemaObj[fieldName]) {
                    if (!isPlatformUser || !doc[fieldName]) {
                        doc[fieldName] = contextVal;
                    }
                }
            };

            enforceBulkStamping('companyField', 'companyId');
            enforceBulkStamping('businessUnitField', 'businessUnitId');
            enforceBulkStamping('outletField', 'outletId');


            // Validate
            if (opts.requireOutlet && !stamp['outletId']) {
                return next(new Error(`[ContextScopePlugin] Bulk Validation Error: Outlet-scoped model requires outlet context`));
            }
            if (opts.requireBusinessUnit && !stamp['businessUnitId']) {
                return next(new Error(`[ContextScopePlugin] Bulk Validation Error: BusinessUnit-scoped model requires BU context`));
            }
        }
        next();
    });
}

// ============================================
// CONVENIENCE EXPORTS FOR COMMON USE CASES
// ============================================

/**
 * Plugin preset for outlet-scoped models (POS transactions, register sessions)
 */
export const outletScopedPlugin = (schema: Schema) => {
    contextScopePlugin(schema, { requireOutlet: true });
};

/**
 * Plugin preset for business unit scoped models (products, inventory)
 */
export const businessUnitScopedPlugin = (schema: Schema) => {
    contextScopePlugin(schema, { requireBusinessUnit: true });
};

/**
 * Plugin preset for company-wide models (users, roles within company)
 */
export const companyScopedPlugin = (schema: Schema) => {
    contextScopePlugin(schema, { requireBusinessUnit: false, requireOutlet: false });
};

/**
 * Marker for global/platform models that should never be filtered
 */
export const globalModelPlugin = (schema: Schema) => {
    contextScopePlugin(schema, { isGlobalModel: true });
};
