const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drces11yl',
  api_key: process.env.CLOUDINARY_API_KEY || '363267514528542',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'W1FmRbXnJYrGEyq1MgQ0-TuDruM',
});

const upload = multer({
  storage: multer.memoryStorage(), // store file in memory buffer
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video and image files are allowed!'), false);
    }
  },
});

// helper function to upload file buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folderName, resourceType) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: resourceType,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = { upload, uploadToCloudinary };
