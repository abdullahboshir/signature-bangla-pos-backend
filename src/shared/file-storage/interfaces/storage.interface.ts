/**
 * Tenant-specific storage configuration.
 * Used for dedicated tenants who have their own storage accounts.
 */
export interface ITenantStorageConfig {
    provider: 'cloudinary' | 's3' | 'local';
    // Cloudinary specific
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
    // S3 specific
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    // Common
    cdnUrl?: string;
    basePath?: string; // Used for folder-based isolation: /{organizationId}/
}

export interface IUploadResult {
    url: string;
    key: string;
    size?: number;
    mimeType?: string;
}

export interface IStorageProvider {
    /**
     * Upload a file to storage
     * @param file - File object from Multer
     * @param folder - Optional subfolder
     * @param tenantPath - Optional tenant prefix for isolation
     * @returns Object containing public URL and storage key
     */
    uploadFile(file: Express.Multer.File, folder?: string, tenantPath?: string): Promise<IUploadResult>;

    /**
     * Delete a file from storage
     * @param key - Storage key (or filename)
     */
    deleteFile(key: string): Promise<void>;

    /**
     * Get public URL for a file
     * @param key - Storage key
     */
    getFileUrl(key: string): Promise<string>;

    /**
     * Upload multiple files (bulk operation)
     * @param files - Array of files
     * @param folder - Optional subfolder
     * @param tenantPath - Optional tenant prefix
     */
    uploadFiles?(files: Express.Multer.File[], folder?: string, tenantPath?: string): Promise<IUploadResult[]>;

    /**
     * Delete multiple files
     * @param keys - Array of storage keys
     */
    deleteFiles?(keys: string[]): Promise<void>;
}
