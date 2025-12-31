export interface IStorageProvider {
    /**
     * Upload a file to storage
     * @param file - File object from Multer
     * @param folder - Optional subfolder
     * @returns Object containing public URL and storage key
     */
    uploadFile(file: Express.Multer.File, folder?: string): Promise<{ url: string; key: string }>;

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
}
