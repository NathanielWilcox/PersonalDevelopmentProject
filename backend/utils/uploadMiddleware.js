import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create upload directory if it doesn't exist
const uploadBaseDir = path.join(__dirname, '..', 'uploads', 'users');

// Ensure uploads directory exists
if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
  console.log(`✅ Created uploads directory at ${uploadBaseDir}`);
}

/**
 * Storage configuration for multer
 * Creates user-specific directories and timestamped filenames
 * Format: /uploads/users/{userId}/{timestamp}-{originalName}
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(uploadBaseDir, String(req.user.id));
    
    // Create user directory if doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Keep original extension, add timestamp for uniqueness
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    
    // Format: title-timestamp.ext (e.g., sunset-1702343400000.jpg)
    const filename = `${nameWithoutExt}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

/**
 * File filter - only allow images and videos
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Only images and videos accepted.`));
  }
};

/**
 * Multer instance configuration
 * - Max file size: 100MB
 * - Single file upload
 * - Image and video only
 */
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

/**
 * Utility function to get relative URL path from uploaded file
 * Converts file system path to HTTP-accessible URL
 * Example: /uploads/users/1/sunset-1702343400000.jpg
 */
export const getMediaUrl = (userId, filename) => {
  return `/uploads/users/${userId}/${filename}`;
};

/**
 * Utility function to get full file path from media URL
 * For cleanup/deletion purposes
 * Example: /uploads/users/1/sunset-1702343400000.jpg → /absolute/path/uploads/users/1/sunset-1702343400000.jpg
 */
export const getFilePath = (mediaUrl) => {
  return path.join(__dirname, '..', mediaUrl);
};

/**
 * Delete uploaded file
 * Safe deletion with error handling
 */
export const deleteMediaFile = (mediaUrl) => {
  try {
    const filePath = getFilePath(mediaUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error deleting file ${mediaUrl}:`, err);
    return false;
  }
};
