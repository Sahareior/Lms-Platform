import multer from 'multer';

// Store files in memory; the upload controller streams them to Cloudinary.
const storage = multer.memoryStorage();

// Accepts only image files, max 10 MB.
export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

// Accepts video files, max 100 MB. Note: memory storage buffers the whole
// file in RAM before streaming to Cloudinary — for production, prefer
// multer-storage-cloudinary or disk storage to avoid OOM on large files.
export const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    cb(new Error('Only video files are allowed'));
  },
});
