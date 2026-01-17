import { v2 as cloudinary } from 'cloudinary';
import type { IStorageProvider, IUploadResult, ITenantStorageConfig } from '../interfaces/storage.interface.js';
import appConfig from '../../../shared/config/app.config.js';
import fs from 'fs/promises';

export class CloudinaryStorageProvider implements IStorageProvider {
    private isConfigured: boolean = false;

    constructor(config?: ITenantStorageConfig) {
        // Use tenant-specific config if provided, otherwise use default
        const cloudName = config?.cloudName || appConfig.cloud_name;
        const apiKey = config?.apiKey || appConfig.cloud_api_key;
        const apiSecret = config?.apiSecret || appConfig.cloud_api_secret;

        if (cloudName && apiKey && apiSecret) {
            cloudinary.config({
                cloud_name: cloudName,
                api_key: apiKey,
                api_secret: apiSecret,
            });
            this.isConfigured = true;
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'others', tenantPath?: string): Promise<IUploadResult> {
        if (!this.isConfigured) {
            throw new Error('Cloudinary is not configured');
        }

        // Construct folder path with tenant isolation
        const fullFolder = tenantPath ? `${tenantPath}/${folder}` : folder;
        const publicId = file.originalname.split('.')[0] || 'file';

        // If file is in memory (buffer)
        if (file.buffer) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: fullFolder, public_id: publicId },
                    (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error("Cloudinary upload failed"));
                        resolve({
                            url: result.secure_url,
                            key: result.public_id,
                            size: result.bytes,
                            mimeType: result.format
                        });
                    }
                );
                uploadStream.end(file.buffer);
            });
        }
        // If file is on disk (path)
        else if (file.path) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: fullFolder,
                public_id: publicId
            });
            // Cleanup local file
            try { await fs.unlink(file.path); } catch { }
            return {
                url: result.secure_url,
                key: result.public_id,
                size: result.bytes,
                mimeType: result.format
            };
        }
        throw new Error('File content missing');
    }

    async uploadFiles(files: Express.Multer.File[], folder: string = 'others', tenantPath?: string): Promise<IUploadResult[]> {
        const results = await Promise.all(
            files.map(file => this.uploadFile(file, folder, tenantPath))
        );
        return results;
    }

    async deleteFile(key: string): Promise<void> {
        await cloudinary.uploader.destroy(key);
    }

    async deleteFiles(keys: string[]): Promise<void> {
        await Promise.all(keys.map(key => this.deleteFile(key)));
    }

    async getFileUrl(key: string): Promise<string> {
        return cloudinary.url(key, { secure: true });
    }
}
