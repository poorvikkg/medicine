const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const medicineStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicare/medicines',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const verificationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'medicare/verifications',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const uploadMedicine = multer({
  storage: medicineStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadVerification = multer({
  storage: verificationStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadMedicine, uploadVerification };
