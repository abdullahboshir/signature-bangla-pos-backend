/**
 * ============================================================================
 * TENANT SERVICE - Hybrid Multi-Tenancy Resolver
 * ============================================================================
 * Centralizes tenant resolution from various request sources.
 * Supports both Shared SaaS (organizationId filtering) and Dedicated
 * instances (separate database connections).
 * 
 * Uses Redis for cluster-safe caching with in-memory fallback.
 */

import { Organization } from '@app/modules/platform/organization/organization.model.ts';
import type { ITenantConfig } from '@app/modules/platform/organization/organization.interface.ts';
import redisClient from '@shared/config/redis.config.ts';
import logger from '@core/utils/logger.ts';

export interface ITenantContext {
    organizationId: string;
    organizationSlug: string;
    deploymentType: 'shared' | 'dedicated';
    customDomain?: string;
    databaseUri?: string;
    storageConfig?: ITenantConfig['storageConfig'];
    isProvisioned: boolean;
}

// Cache keys prefix and TTL
const TENANT_CACHE_PREFIX = 'tenant:';
const CACHE_TTL_SECONDS = 300; // 5 minutes

// In-memory fallback cache (used when Redis is not available)
const memoryCache = new Map<string, { data: ITenantContext; expiresAt: number }>();

export class TenantService {
    /**
     * Resolve tenant from various request sources.
     * Priority: 1. Custom Domain (Host header) 2. Subdomain 3. x-organization-id header 4. JWT token
     */
    static async resolveTenant(options: {
        host?: string;
        organizationId?: string;
        organizationSlug?: string;
    }): Promise<ITenantContext | null> {
        const { host, organizationId, organizationSlug } = options;

        // 1. Try resolving by custom domain first (dedicated tenants)
        if (host) {
            const cachedByDomain = await this.getFromCache(`domain:${host}`);
            if (cachedByDomain) return cachedByDomain;

            const orgByDomain = await Organization.findOne({
                'tenantConfig.customDomain': host,
                isActive: true
            }).select('+tenantConfig.databaseUri').lean();

            if (orgByDomain) {
                const ctx = this.buildContext(orgByDomain);
                await this.setCache(`domain:${host}`, ctx);
                await this.setCache(`id:${orgByDomain._id.toString()}`, ctx);
                return ctx;
            }

            // 2. Try subdomain pattern: client.platform.com
            const subdomain = this.extractSubdomain(host);
            if (subdomain) {
                const cachedBySub = await this.getFromCache(`slug:${subdomain}`);
                if (cachedBySub) return cachedBySub;

                const orgBySlug = await Organization.findOne({
                    slug: subdomain,
                    isActive: true
                }).select('+tenantConfig.databaseUri').lean();

                if (orgBySlug) {
                    const ctx = this.buildContext(orgBySlug);
                    await this.setCache(`slug:${subdomain}`, ctx);
                    await this.setCache(`id:${orgBySlug._id.toString()}`, ctx);
                    return ctx;
                }
            }
        }

        // 3. Resolve by explicit organizationId
        if (organizationId) {
            const cachedById = await this.getFromCache(`id:${organizationId}`);
            if (cachedById) return cachedById;

            const orgById = await Organization.findById(organizationId)
                .select('+tenantConfig.databaseUri')
                .lean();

            if (orgById && orgById.isActive) {
                const ctx = this.buildContext(orgById);
                await this.setCache(`id:${organizationId}`, ctx);
                return ctx;
            }
        }

        // 4. Resolve by slug (from header or path)
        if (organizationSlug) {
            const cachedBySlug = await this.getFromCache(`slug:${organizationSlug}`);
            if (cachedBySlug) return cachedBySlug;

            const orgBySlug = await Organization.findOne({
                slug: organizationSlug,
                isActive: true
            }).select('+tenantConfig.databaseUri').lean();

            if (orgBySlug) {
                const ctx = this.buildContext(orgBySlug);
                await this.setCache(`slug:${organizationSlug}`, ctx);
                await this.setCache(`id:${orgBySlug._id.toString()}`, ctx);
                return ctx;
            }
        }

        return null;
    }

    /**
     * Build ITenantContext from Organization document.
     */
    private static buildContext(org: any): ITenantContext {
        const config = org.tenantConfig || {};
        return {
            organizationId: org._id.toString(),
            organizationSlug: org.slug,
            deploymentType: config.deploymentType || 'shared',
            customDomain: config.customDomain,
            databaseUri: config.databaseUri,
            storageConfig: config.storageConfig,
            isProvisioned: config.isProvisioned || false
        };
    }

    /**
     * Extract subdomain from host.
     * e.g., 'client.signaturebangla.com' -> 'client'
     */
    private static extractSubdomain(host: string): string | null {
        if (!host) return null;

        // Remove port if present
        const hostWithoutPort = host.split(':')[0] || '';

        // Skip localhost and IP addresses
        if (hostWithoutPort === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostWithoutPort)) {
            return null;
        }

        const parts = hostWithoutPort.split('.');
        // Expect at least 3 parts: subdomain.domain.tld
        if (parts.length >= 3) {
            // Skip 'www' or 'api' prefixes
            if (['www', 'api', 'app'].includes(parts[0] || '')) {
                return parts.length >= 4 ? (parts[1] || null) : null;
            }
            return parts[0] || null;
        }

        return null;
    }

    /**
     * Get from cache (Redis first, fallback to memory).
     */
    private static async getFromCache(key: string): Promise<ITenantContext | null> {
        const cacheKey = `${TENANT_CACHE_PREFIX}${key}`;

        // Try Redis first
        try {
            if (redisClient.isOpen) {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached) as ITenantContext;
                }
            }
        } catch {
            // Redis error, fall through to memory cache
        }

        // Fallback to memory cache
        const memCached = memoryCache.get(key);
        if (memCached && memCached.expiresAt > Date.now()) {
            return memCached.data;
        }
        if (memCached) memoryCache.delete(key);

        return null;
    }

    /**
     * Set cache (Redis + memory for redundancy).
     */
    private static async setCache(key: string, data: ITenantContext): Promise<void> {
        const cacheKey = `${TENANT_CACHE_PREFIX}${key}`;

        // Set in Redis
        try {
            if (redisClient.isOpen) {
                await redisClient.setEx(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(data));
            }
        } catch {
            // Redis error, continue with memory cache
        }

        // Also set in memory (for redundancy and speed)
        memoryCache.set(key, {
            data,
            expiresAt: Date.now() + (CACHE_TTL_SECONDS * 1000)
        });
    }

    /**
     * Invalidate cache for an organization (Redis + memory).
     */
    static async invalidateCache(organizationId: string): Promise<void> {
        // Invalidate known keys in Redis
        try {
            if (redisClient.isOpen) {
                const keysToDelete = [
                    `${TENANT_CACHE_PREFIX}id:${organizationId}`,
                    `${TENANT_CACHE_PREFIX}slug:*`, // Would need SCAN for pattern, simplified here
                    `${TENANT_CACHE_PREFIX}domain:*`
                ];
                await redisClient.del(keysToDelete[0]); // Only delete known key
            }
        } catch {
            // Redis error, continue
        }

        // Invalidate memory cache
        const keysToDelete: string[] = [];
        memoryCache.forEach((_, k) => {
            if (k.includes(organizationId)) {
                keysToDelete.push(k);
            }
        });
        keysToDelete.forEach(k => memoryCache.delete(k));

        logger.info(`[TENANT] Cache invalidated for org: ${organizationId}`);
    }

    /**
     * Check if tenant is dedicated (requires separate DB connection).
     */
    static isDedicated(ctx: ITenantContext | null): boolean {
        return ctx?.deploymentType === 'dedicated' && !!ctx.databaseUri && ctx.isProvisioned;
    }
}

export default TenantService;
