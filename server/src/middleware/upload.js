import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Storage engine with safe sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    cb(null, `${safeBase}_${uniqueSuffix}${ext}`);
  }
});

// File filter: accept only jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

export const uploadComplaintImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max per file
    files: 4 // up to 4 images
  }
}).array('images', 4);

// Wrapper to handle Multer errors cleanly
export function handleUpload(req, res, next) {
  uploadComplaintImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds maximum allowable limit of 5 MB',
          errors: [{ field: 'images', message: 'Maximum file size is 5 MB' }]
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded. Maximum 4 images allowed.',
          errors: [{ field: 'images', message: 'Maximum 4 images allowed' }]
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
        errors: [{ field: 'images', message: err.message }]
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed',
        errors: [{ field: 'images', message: err.message }]
      });
    }
    next();
  });
}

export default handleUpload;
