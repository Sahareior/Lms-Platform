import cloudinary from '../config/cloudinary.js';

/**
 * Upload a single file (already buffered by multer) to Cloudinary.
 * Returns { url, publicId } or throws.
 */
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'brainforge',
        resource_type: 'auto',
         chunk_size: 6000000, // 6 MB chunk size
        timeout: 600000,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

/** POST /upload/image — expects multipart field `file` (image). */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, { resource_type: 'image' });
    res.status(201).json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error('Cloudinary image upload error:', err);
    res.status(500).json({ message: 'Image upload failed' });
  }
};

/** POST /upload/video — expects multipart field `file` (video). */
export const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, { resource_type: 'video' });
    res.status(201).json({
      message: 'Video uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
    });
  } catch (err) {
    console.error('Cloudinary video upload error:', err);
    res.status(500).json({ message: 'Video upload failed' });
  }
};

/** POST /upload/file — generic upload for resources (PDF, DOC, PPT, audio, ...). */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, { resource_type: 'auto' });
    res.status(201).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    console.error('Cloudinary file upload error:', err);
    res.status(500).json({ message: 'File upload failed' });
  }
};
