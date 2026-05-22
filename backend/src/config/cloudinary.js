const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

let uploadMedicine;
let uploadVerification;
let cloudinaryConfigured = false;

if (useCloudinary) {
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

  uploadMedicine = multer({
    storage: medicineStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  uploadVerification = multer({
    storage: verificationStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  
  cloudinaryConfigured = true;
} else {
  // Ensure local uploads directory exists
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const originalUploadMedicine = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  const originalUploadVerification = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });

  // Wrapper middleware: returns a SINGLE function (not an array) so Express routes work correctly
  const makeUploadMiddleware = (multerInstance) => ({
    single: (fieldname) => (req, res, next) => {
      multerInstance.single(fieldname)(req, res, (err) => {
        if (err) return next(err);
        // Transform the local file path to a full URL so controllers work the same way
        if (req.file) {
          const host = req.get('host') || 'localhost:5000';
          req.file.path = `${req.protocol}://${host}/uploads/${req.file.filename}`;
        }
        next();
      });
    }
  });

  uploadMedicine = makeUploadMiddleware(originalUploadMedicine);
  uploadVerification = makeUploadMiddleware(originalUploadVerification);
  
  console.log('Cloudinary not configured. Falling back to local disk storage.');
}

// Mock cloudinary for deletion when using local storage
let cloudinaryExport = cloudinary;
if (!cloudinaryConfigured) {
  cloudinaryExport = {
    uploader: {
      destroy: async (publicId) => {
        try {
          if (publicId) {
            // Check if publicId is a full URL, extract the filename
            let filename = publicId;
            if (publicId.includes('/uploads/')) {
              filename = publicId.split('/uploads/').pop();
            }
            
            const localPath = path.join(__dirname, '../../uploads', filename);
            if (fs.existsSync(localPath)) {
              fs.unlinkSync(localPath);
              console.log(`Deleted local file: ${localPath}`);
            }
          }
        } catch (e) {
          console.error('Error deleting local file:', e.message);
        }
        return { result: 'ok' };
      }
    }
  };
}

module.exports = { cloudinary: cloudinaryExport, uploadMedicine, uploadVerification };
