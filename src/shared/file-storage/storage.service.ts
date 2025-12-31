import { StorageFactory } from './storage.factory.js';

export class StorageService {
    static async uploadFile(file: Express.Multer.File, folder?: string) {
        const provider = StorageFactory.getProvider();
        return await provider.uploadFile(file, folder);
    }

    static async deleteFile(key: string) {
        const provider = StorageFactory.getProvider();
        return await provider.deleteFile(key);
    }

    static async getFileUrl(key: string) {
        const provider = StorageFactory.getProvider();
        return await provider.getFileUrl(key);
    }
}
