import type { IStorageProvider } from '../interfaces/storage.interface.js';

export class S3StorageProvider implements IStorageProvider {
    // private client: S3Client;

    constructor() {
        // this.client = new S3Client({ ... });
        console.warn("S3 Storage Provider initialized but not fully implemented (Reference only)");
    }

    async uploadFile(_file: Express.Multer.File, _folder: string = 'others'): Promise<{ url: string; key: string }> {
        throw new Error("S3 Storage upload not implemented yet. Please install @aws-sdk/client-s3");
    }

    async deleteFile(_key: string): Promise<void> {
        throw new Error("S3 Storage delete not implemented");
    }

    async getFileUrl(_key: string): Promise<string> {
        throw new Error("S3 Storage getUrl not implemented");
    }
}
