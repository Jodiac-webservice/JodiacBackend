const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'drces11yl',
    api_key: '363267514528542',
    api_secret: 'W1FmRbXnJYrGEyq1MgQ0-TuDruM'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video');
        const folderName = isVideo ? 'videos' : 'products';
        const resourceType = isVideo ? 'video' : 'image';
        const format = isVideo ? 'mp4' : 'jpg';

        return {
            folder: folderName,
            resource_type: resourceType,
            public_id: file.originalname.split('.')[0],
            format: format,
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        };
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'video/mp4',
            'video/mpeg',
            'video/quicktime',
            'video/x-msvideo',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only video and image files are allowed!'), false);
        }
    }
});

module.exports = upload;
