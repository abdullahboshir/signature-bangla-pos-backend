import type { Request, Response } from 'express';
import { sendImageToCloudinary } from '@core/utils/file-upload.ts';
import catchAsync from '@core/utils/catchAsync.ts';
import { ApiResponse } from '@core/utils/api-response.ts';
import httpStatus from 'http-status';

const uploadImage = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new Error('No file uploaded');
    }
    const result: any = await sendImageToCloudinary(req.file.filename, req.file.path);

    ApiResponse.success(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Image uploaded successfully',
        data: {
            url: result.secure_url,
            public_id: result.public_id
        }
    });
});

export const UploadController = {
    uploadImage
};
