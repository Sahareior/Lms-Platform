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

/** POST /upload/file — generic upload for resources (PDF, DOC, PPT, audio, ...).
 *  Uses `resource_type: 'raw'` on purpose: Cloudinary's `auto` detection treats
 *  PDFs as image assets (converts them / can fail with "Invalid PDF file" and
 *  hang on large files). Raw keeps the original file intact — the correct
 *  behaviour for lesson materials. */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const result = await uploadToCloudinary(req.file.buffer, { resource_type: 'raw' });
    res.status(201).json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname,
      mimeType: req.file.mimetype,
    });
  } catch (err) {
    console.error('Cloudinary file upload error:', err);
    // Surface the real reason (e.g. "Invalid PDF file") so the admin UI can
    // show something actionable instead of a generic failure.
    res.status(500).json({ message: err?.message || 'File upload failed' });
  }
};

/** POST /upload/sign — issues a one-time signed upload so the browser can
 *  upload files DIRECTLY to Cloudinary, bypassing this server for the large
 *  file transfer. This avoids "Request Timeout" errors, memory pressure and
 *  concurrency issues caused by proxying big files through Express, and also
 *  sidesteps Vercel's ~4.5 MB request body limit when deployed.
 *
 *  Per Cloudinary's signing rules, the signature covers every parameter sent
 *  EXCEPT `file`, `api_key`, `resource_type` and `cloud_name` — so we sign
 *  `timestamp` + `folder`, and the browser sends those same values alongside
 *  `api_key` and `signature`. */
export const getUploadSignature = (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ message: 'Cloudinary credentials are not configured' });
    }

    const timestamp = Math.round(Date.now() / 1000);
    // Folder is locked server-side so clients can't redirect uploads elsewhere.
    const folder = 'brainforge';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    res.json({
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      folder,
      signature,
    });
  } catch (err) {
    console.error('Cloudinary signature error:', err);
    res.status(500).json({ message: 'Failed to generate upload signature' });
  }
};
