import type { Request, Response } from 'express';
import { StorageService } from '../../../../../shared/file-storage/storage.service.js';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import httpStatus from 'http-status';

const uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }
    const result = await StorageService.uploadFile(req.file, 'uploads');

    ApiResponse.success(
        res,
        {
            url: result.url,
            public_id: result.key
        },
        'Image uploaded successfully',
        httpStatus.OK
    );
});

export const UploadController = {
    uploadImage
};
