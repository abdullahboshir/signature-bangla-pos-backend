import { Router } from 'express';
import { upload } from '@core/utils/file-upload.ts';
import { UploadController } from './upload.controller.js';

const router = Router();

router.post('/image', upload.single('image'), UploadController.uploadImage);

export const UploadRoutes = router;
