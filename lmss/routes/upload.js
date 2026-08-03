import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { uploadImage as uploadImageMulter, uploadVideo as uploadVideoMulter } from '../middleware/upload.js';
import { uploadImage, uploadVideo } from '../controller/uploadController.js';

const router = express.Router();

// Both endpoints require a valid JWT. The multer middleware parses the
// multipart body, then the controller streams the file to Cloudinary.
router.post('/image', uploadImageMulter.single('file'), uploadImage);
router.post('/video', uploadVideoMulter.single('file'), uploadVideo);

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
