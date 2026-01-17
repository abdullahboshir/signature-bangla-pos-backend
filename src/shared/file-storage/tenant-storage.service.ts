/**
 * ============================================================================
 * TENANT STORAGE SERVICE - Multi-Tenant File Storage Router
 * ============================================================================
 * Routes file operations to the correct storage provider based on tenant config.
 * Supports folder-based isolation (shared) and provider-based isolation (dedicated).
 */

import type { IStorageProvider, IUploadResult, ITenantStorageConfig } from './interfaces/storage.interface.js';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider.js';
import { S3StorageProvider } from './providers/s3.provider.js';
import { LocalStorageProvider } from './providers/local.provider.js';
import type { ITenantContext } from '@core/services/tenant.service.ts';
import appConfig from '../config/app.config.js';
import logger from '@core/utils/logger.ts';

// Cache for tenant-specific providers (avoids recreating on each request)
const providerCache = new Map<string, IStorageProvider>();

// Default provider instance
let defaultProvider: IStorageProvider | null = null;

/**
 * Get the default storage provider (used for shared tenants).
 */
function getDefaultProvider(): IStorageProvider {
    if (defaultProvider) return defaultProvider;

    const providerType = appConfig.storage.provider;

    switch (providerType) {
        case 'cloudinary':
            defaultProvider = new CloudinaryStorageProvider();
            break;
        case 's3':
            defaultProvider = new S3StorageProvider();
            break;
        case 'local':
        default:
            defaultProvider = new LocalStorageProvider();
            break;
    }

    return defaultProvider;
}

/**
 * Get provider for a dedicated tenant.
 */
function getTenantProvider(tenantId: string, config: ITenantStorageConfig): IStorageProvider {
    // Check cache first
    const cached = providerCache.get(tenantId);
    if (cached) return cached;

    let provider: IStorageProvider;

    switch (config.provider) {
        case 'cloudinary':
            provider = new CloudinaryStorageProvider(config);
            break;
        case 's3':
            provider = new S3StorageProvider(config);
            break;
        case 'local':
        default:
            provider = new LocalStorageProvider();
            break;
    }

    providerCache.set(tenantId, provider);
    return provider;
}

/**
 * Build tenant path for folder-based isolation.
 */
function buildTenantPath(organizationId: string): string {
    return `org-${organizationId}`;
}

export class TenantStorageService {
    /**
     * Upload a file with automatic tenant isolation.
     * @param file - File from Multer
     * @param folder - Subfolder (e.g., 'products', 'avatars')
     * @param tenant - Optional tenant context (auto-resolves if not provided)
     */
    static async uploadFile(
        file: Express.Multer.File,
        folder: string = 'others',
        tenant?: ITenantContext | null
    ): Promise<IUploadResult> {
        const { provider, tenantPath } = this.resolveProviderAndPath(tenant);
        return provider.uploadFile(file, folder, tenantPath);
    }

    /**
     * Upload multiple files with tenant isolation.
     */
    static async uploadFiles(
        files: Express.Multer.File[],
        folder: string = 'others',
        tenant?: ITenantContext | null
    ): Promise<IUploadResult[]> {
        const { provider, tenantPath } = this.resolveProviderAndPath(tenant);

        if (provider.uploadFiles) {
            return provider.uploadFiles(files, folder, tenantPath);
        }

        // Fallback: upload one by one
        return Promise.all(files.map(file => provider.uploadFile(file, folder, tenantPath)));
    }

    /**
     * Delete a file.
     */
    static async deleteFile(key: string, tenant?: ITenantContext | null): Promise<void> {
        const { provider } = this.resolveProviderAndPath(tenant);
        return provider.deleteFile(key);
    }

    /**
     * Delete multiple files.
     */
    static async deleteFiles(keys: string[], tenant?: ITenantContext | null): Promise<void> {
        const { provider } = this.resolveProviderAndPath(tenant);

        if (provider.deleteFiles) {
            return provider.deleteFiles(keys);
        }

        // Fallback: delete one by one
        await Promise.all(keys.map(key => provider.deleteFile(key)));
    }

    /**
     * Get public URL for a file.
     */
    static async getFileUrl(key: string, tenant?: ITenantContext | null): Promise<string> {
        const { provider } = this.resolveProviderAndPath(tenant);
        return provider.getFileUrl(key);
    }

    /**
     * Resolve the appropriate provider and tenant path based on context.
     */
    private static resolveProviderAndPath(tenant?: ITenantContext | null): {
        provider: IStorageProvider;
        tenantPath?: string;
    } {
        // No tenant context - use default provider without isolation
        if (!tenant) {
            return { provider: getDefaultProvider() };
        }

        const storageConfig = tenant.storageConfig;

        // Dedicated tenant with custom storage config
        if (tenant.deploymentType === 'dedicated' && storageConfig?.provider) {
            logger.debug(`[STORAGE] Using dedicated provider for: ${tenant.organizationSlug}`);
            return {
                provider: getTenantProvider(tenant.organizationId, storageConfig as ITenantStorageConfig),
                tenantPath: storageConfig.basePath || buildTenantPath(tenant.organizationId)
            };
        }

        // Shared tenant - use default provider with folder isolation
        logger.debug(`[STORAGE] Using shared provider with isolation for: ${tenant.organizationSlug}`);
        return {
            provider: getDefaultProvider(),
            tenantPath: buildTenantPath(tenant.organizationId)
        };
    }

    /**
     * Clear provider cache for a specific tenant (call when tenant config changes).
     */
    static invalidateProviderCache(tenantId: string): void {
        providerCache.delete(tenantId);
        logger.info(`[STORAGE] Provider cache invalidated for: ${tenantId}`);
    }

    /**
     * Clear all provider caches.
     */
    static clearAllCaches(): void {
        providerCache.clear();
        defaultProvider = null;
        logger.info('[STORAGE] All provider caches cleared');
    }
}

export default TenantStorageService;
