import multer from 'multer';
import { StorageService } from '../../shared/file-storage/storage.service.js';


// Helper for backward compatibility
// Redirects old "sendImageToCloudinary" logic to new StorageService
export const sendImageToCloudinary = async (imgName: string, path: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a mock Multer file object from the path
      // This assumes we are using DiskStorage (file exists on disk)
      const mockFile = {
        path: path,
        originalname: imgName, // Use imgName as originalname to influence key generation
        filename: imgName,
        destination: '',
        mimetype: 'application/octet-stream', // Unknown, generic
        size: 0,
        buffer: Buffer.alloc(0), // No buffer for disk files
        fieldname: 'file',
        stream: null as any,
        encoding: '7bit'
      } as Express.Multer.File;

      const result = await StorageService.uploadFile(mockFile, 'uploads');

      resolve({
        secure_url: result.url,
        public_id: result.key
      });
    } catch (error) {
      reject(error);
    }
  });
};

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, process.cwd() + '/uploads')
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // Extract extension from original name
    const ext = file.originalname.split('.').pop();
    const filename = `${file.fieldname}-${uniqueSuffix}.${ext}`;
    cb(null, filename)
  },
})

export const upload = multer({ storage: storage })
