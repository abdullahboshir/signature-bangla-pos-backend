import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import multer from 'multer'
import config from '../config/app.config.js'


// Configuration
cloudinary.config({
  cloud_name: config.cloud_name,
  api_key: config.cloud_api_key,
  api_secret: config.cloud_api_secret,
})

export const sendImageToCloudinary = async (imgName: string, path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      {
        public_id: imgName,
      },
      function (error, result) {
        if (error) {
          reject(error)
        }
        resolve(result)

        // delete a file asynchronously
        fs.unlink(path, (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('File is deleted.')
          }
        })
      },
    )
  })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  },
})

export const upload = multer({ storage: storage })
