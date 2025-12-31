import { v2 as cloudinary } from 'cloudinary';
import type { IStorageProvider } from '../interfaces/storage.interface.js';
import appConfig from '../../../shared/config/app.config.js';
import fs from 'fs/promises';

export class CloudinaryStorageProvider implements IStorageProvider {
    constructor() {
        cloudinary.config({
            cloud_name: appConfig.cloud_name,
            api_key: appConfig.cloud_api_key,
            api_secret: appConfig.cloud_api_secret,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'others'): Promise<{ url: string; key: string }> {
        const publicId = file.originalname.split('.')[0] || 'file'; // fallback

        // If file is in memory (buffer)
        if (file.buffer) {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: folder, public_id: publicId },
                    (error, result) => {
                        if (error) return reject(error);
                        if (!result) return reject(new Error("Cloudinary upload failed"));
                        resolve({ url: result.secure_url, key: result.public_id });
                    }
                );
                uploadStream.end(file.buffer);
            });
        }
        // If file is on disk (path)
        else if (file.path) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folder,
                public_id: publicId
            });
            // Cleanup local file
            try { await fs.unlink(file.path); } catch { }
            return { url: result.secure_url, key: result.public_id };
        }
        throw new Error('File content missing');
    }

    async deleteFile(key: string): Promise<void> {
        await cloudinary.uploader.destroy(key);
    }

    async getFileUrl(key: string): Promise<string> {
        // Cloudinary URL generation if needed, or just return basic
        return cloudinary.url(key, { secure: true });
    }
}
