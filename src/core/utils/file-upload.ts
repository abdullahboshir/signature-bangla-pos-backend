import appConfig from '@shared/config/app.config.ts'
import { v2 as cloudinary } from 'cloudinary'
import _fs from 'fs'
import multer from 'multer'



// Configuration
cloudinary.config({
  cloud_name: appConfig.cloud_name,
  api_key: appConfig.cloud_api_key,
  api_secret: appConfig.cloud_api_secret,
})

export const sendImageToCloudinary = async (imgName: string, path: string) => {
  // Return local file path directly for development reliability
  // Ensure the path is relative to the server root for the frontend to access
  return new Promise((resolve, _reject) => {
    // Assume file is already in /uploads via Multer
    // We just need to return the URL format that the controller expects
    // Controller expects: result.secure_url

    // We need to extract the filename from the path if needed, 
    // but imgName passed here is usually just the name, valid for public_id.
    // However, multer 'filename' is what we need for the URL.

    // Let's assume the file is saved at 'path'. 
    // We want to return '/uploads/filename'. 
    // path is typically "E:\...\uploads\image-123.png"

    const filename = path.split(/[/\\]/).pop(); // Extract filename from full path
    const localUrl = `/uploads/${filename}`;

    console.log("Local Upload returning:", localUrl);

    resolve({
      secure_url: localUrl,
      public_id: imgName
    });

    // Do NOT delete the file
    /*
    cloudinary.uploader.upload(
        path,
        { public_id: imgName, folder: async (_req: any, _file: any) => {
      // Logic for changing directory based on request
      // e.g., req.body.category
      return 'others';
    }},
        function (error, result) {
            if (error) _reject(error)
            resolve(result)
            _fs.unlink(path, (err) => { // ... })
        }
    )
    */
  })
}

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
