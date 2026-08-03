import { v2 as cloudinary } from 'cloudinary';

// Reads credentials from the environment (.env file).
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 600000, // Timeout in ms (e.g. 10 minutes)
});


export default cloudinary;
