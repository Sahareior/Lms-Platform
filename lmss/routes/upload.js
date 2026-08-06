import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadImage as uploadImageMulter, uploadVideo as uploadVideoMulter, uploadFile as uploadFileMulter } from '../middleware/upload.js';
import { uploadImage, uploadVideo, uploadFile, getUploadSignature } from '../controller/uploadController.js';

const router = express.Router();

// All endpoints require a valid JWT. The multer middleware parses the
// multipart body, then the controller streams the file to Cloudinary.
router.post('/image', uploadImageMulter.single('file'), uploadImage);
router.post('/video', uploadVideoMulter.single('file'), uploadVideo);
router.post('/file', uploadFileMulter.single('file'), uploadFile);

// Returns signed upload params for direct browser → Cloudinary uploads.
// The client streams the file straight to api.cloudinary.com, so large files
// never pass through this server (no timeouts, no 4.5 MB Vercel body limit).
router.post('/sign', authenticate, getUploadSignature);

// Convert multer errors (wrong file type / size exceeded) into JSON
// responses so the frontend can parse err.data.message.
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : `Upload error: ${err.code}`;
    return res.status(400).json({ message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload failed' });
  }
  _next();
});

export default router;
