import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { IStorageProvider, IUploadResult, ITenantStorageConfig } from '../interfaces/storage.interface.js';
import appConfig from '../../../shared/config/app.config.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class S3StorageProvider implements IStorageProvider {
    private client: S3Client;
    private bucket: string;
    private region: string;
    private cdnUrl?: string;

    constructor(config?: ITenantStorageConfig) {
        // Use tenant-specific config if provided, otherwise use default
        this.region = config?.region || (appConfig.storage.s3.region as string) || 'ap-southeast-1';
        this.bucket = config?.bucket || (appConfig.storage.s3.bucket as string) || '';
        this.cdnUrl = config?.cdnUrl || appConfig.storage.cdn_url;

        const accessKeyId = config?.accessKeyId || appConfig.storage.s3.access_key_id;
        const secretAccessKey = config?.secretAccessKey || appConfig.storage.s3.secret_access_key;

        if (!accessKeyId || !secretAccessKey) {
            console.warn('[S3] AWS credentials not configured');
        }

        // Initialize S3Client with explicit credentials type to satisfy TS
        this.client = new S3Client({
            region: this.region,
            credentials: accessKeyId && secretAccessKey ? {
                accessKeyId: accessKeyId as string,
                secretAccessKey: secretAccessKey as string,
            } : undefined,
        });
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'others', tenantPath?: string): Promise<IUploadResult> {
        if (!this.bucket) {
            throw new Error('S3 bucket not configured');
        }

        // Generate unique key with tenant isolation
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const uniqueId = uuidv4().split('-')[0];
        const fileName = `${baseName}-${uniqueId}${ext}`;

        // Construct key with tenant path for isolation
        const key = tenantPath
            ? `${tenantPath}/${folder}/${fileName}`
            : `${folder}/${fileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer || await this.readFileAsBuffer(file.path),
            ContentType: file.mimetype,
            ContentLength: file.size,
            // Enable server-side encryption
            ServerSideEncryption: 'AES256',
        });

        await this.client.send(command);

        // Construct URL
        const url = this.cdnUrl
            ? `${this.cdnUrl}/${key}`
            : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

        return {
            url,
            key,
            size: file.size,
            mimeType: file.mimetype
        };
    }

    async uploadFiles(files: Express.Multer.File[], folder: string = 'others', tenantPath?: string): Promise<IUploadResult[]> {
        const results = await Promise.all(
            files.map(file => this.uploadFile(file, folder, tenantPath))
        );
        return results;
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.client.send(command);
    }

    async deleteFiles(keys: string[]): Promise<void> {
        if (keys.length === 0) return;

        const command = new DeleteObjectsCommand({
            Bucket: this.bucket,
            Delete: {
                Objects: keys.map(key => ({ Key: key })),
            },
        });

        await this.client.send(command);
    }

    async getFileUrl(key: string): Promise<string> {
        // If CDN is configured, use it
        if (this.cdnUrl) {
            return `${this.cdnUrl}/${key}`;
        }

        // Generate pre-signed URL for private objects
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        // URL valid for 1 hour
        return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    /**
     * Helper to read file from disk as buffer
     */
    private async readFileAsBuffer(filePath?: string): Promise<Buffer> {
        if (!filePath) {
            throw new Error('File path required');
        }
        const fs = await import('fs/promises');
        return fs.readFile(filePath);
    }
}
