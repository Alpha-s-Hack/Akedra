import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists with full permissions
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o777 });
}

console.log('Upload directory configured at:', uploadDir);
console.log('Upload directory permissions:', fs.statSync(uploadDir).mode);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    console.log('Attempting to save file to:', uploadDir);
    // Verify directory is writable
    try {
      fs.accessSync(uploadDir, fs.constants.W_OK);
      console.log('Upload directory is writable');
    } catch (err) {
      console.error('Upload directory is not writable:', err);
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});

// Temporarily accept all files for testing
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  console.log('Processing file upload:');
  console.log('- Original name:', file.originalname);
  console.log('- Mime type:', file.mimetype);
  console.log('- Field name:', file.fieldname);
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for testing
  },
});

