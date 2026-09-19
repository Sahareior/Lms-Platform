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
    const result = await uploadToCloudinary(req.file.buffer, { resource_type: 'raw', access_mode: 'public' });
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
    // access_mode must be signed to guarantee public delivery for raw (PDF)
    // files — without it Cloudinary may restrict access and return 401.
    const access_mode = 'public';

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, access_mode },
      apiSecret
    );

    res.json({
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      folder,
      access_mode,
      signature,
    });
  } catch (err) {
    console.error('Cloudinary signature error:', err);
    res.status(500).json({ message: 'Failed to generate upload signature' });
  }
};

/** GET /upload/pdf-url?url=<cloudinaryRawUrl>
 *  Extracts the public_id from a Cloudinary raw delivery URL and returns a
 *  short-lived signed URL that bypasses account-level raw resource restrictions
 *  (HTTP 401). The client never needs the API secret — all signing happens here.
 */
export const getSignedPdfUrl = (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) return res.status(400).json({ message: 'url query param required' });

    // Extract the public_id from the Cloudinary delivery URL.
    // URL shape: https://res.cloudinary.com/<cloud>/raw/upload/v<ver>/<public_id>
    // For raw files the public_id always includes the file extension.
    const match = rawUrl.match(/\/raw\/upload\/(?:v\d+\/)?(.+)$/);
    if (!match) return res.status(400).json({ message: 'Could not parse Cloudinary URL' });
    const publicId = match[1];

    // Generate a signed delivery URL valid for 1 hour.
    const signedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'upload',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    res.json({ url: signedUrl });
  } catch (err) {
    console.error('Signed PDF URL error:', err);
    res.status(500).json({ message: 'Failed to generate signed URL' });
  }
};
