import type { IStorageProvider } from './interfaces/storage.interface.js';
import { LocalStorageProvider } from './providers/local.provider.js';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider.js';
import { S3StorageProvider } from './providers/s3.provider.js';

export class StorageFactory {
    // Simple singleton or factory method
    private static instance: IStorageProvider;

    static getProvider(): IStorageProvider {
        if (this.instance) return this.instance;

        const providerType = process.env['STORAGE_PROVIDER'] || 'local'; // 'local', 'cloudinary', 's3'
        const isProduction = process.env['NODE_ENV'] === 'production';

        if (isProduction && providerType === 'local') {
            throw new Error(
                "❌ CRITICAL SECURITY RISK: Local storage provider is disabled in PRODUCTION. \n" +
                "Please set STORAGE_PROVIDER=s3 or STORAGE_PROVIDER=cloudinary in your .env file."
            );
        }

        switch (providerType) {
            case 'cloudinary':
                this.instance = new CloudinaryStorageProvider();
                break;
            case 's3':
                this.instance = new S3StorageProvider();
                break;
            case 'local':
            default:
                this.instance = new LocalStorageProvider();
                break;
        }
        return this.instance;
    }
}
