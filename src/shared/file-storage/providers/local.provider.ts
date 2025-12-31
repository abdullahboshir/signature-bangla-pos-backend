import fs from 'fs/promises';
import path from 'path';
import type { IStorageProvider } from '../interfaces/storage.interface.js';
// Removed unused appConfig import
// Assuming appConfig has base_url or similar. If not, use relative URL.

export class LocalStorageProvider implements IStorageProvider {
    private baseDir: string;
    private baseUrl: string;

    constructor() {
        this.baseDir = path.join(process.cwd(), 'storage');
        // Ensure base directory exists
        this.ensureDir(this.baseDir);
        this.baseUrl = '/storage'; // Serves from root/storage mapped to /storage url
    }

    private async ensureDir(dir: string) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'others'): Promise<{ url: string; key: string }> {
        const targetFolder = path.join(this.baseDir, folder);
        await this.ensureDir(targetFolder);

        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(/\\s+/g, '-')}`;
        const filePath = path.join(targetFolder, filename);

        // If file.buffer is available (MemoryStorage), write it.
        // If file.path is available (DiskStorage), move/copy it.
        if (file.buffer) {
            await fs.writeFile(filePath, file.buffer);
        } else if (file.path) {
            // Move from temp upload to storage
            await fs.copyFile(file.path, filePath);
            // Optional: unlink old file
            // await fs.unlink(file.path);
        } else {
            throw new Error('File content not found (no buffer or path)');
        }

        const key = `${folder}/${filename}`;
        // Construct local URL. Assuming app serves '/storage' 
        const url = `${this.baseUrl}/${key}`;

        return { url, key };
    }

    async deleteFile(key: string): Promise<void> {
        const filePath = path.join(this.baseDir, key);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            // Ignore if not found
            console.warn(`Failed to delete file ${key}:`, error);
        }
    }

    async getFileUrl(key: string): Promise<string> {
        return `${this.baseUrl}/${key}`;
    }
}
