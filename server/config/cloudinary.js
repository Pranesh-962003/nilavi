import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
};

if (isCloudinaryConfigured()) {
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloudinary_url: process.env.CLOUDINARY_URL
    });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
  console.log('☁️ Cloudinary configured successfully.');
} else {
  console.log('ℹ️ Cloudinary credentials not detected in .env. Uploads will fallback gracefully.');
}

/**
 * Uploads an image (base64 data URI, local path, or remote URL) to Cloudinary.
 * @param {string} imageInput - Base64 data URI or image URL
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string>} The uploaded secure HTTPS URL, or the original image if Cloudinary is unconfigured
 */
export async function uploadToCloudinary(imageInput, folder = 'nilavi') {
  if (!imageInput || typeof imageInput !== 'string') {
    return imageInput;
  }

  // If already a remote Cloudinary URL or http/https URL that is not a data URI
  if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
    return imageInput;
  }

  if (!isCloudinaryConfigured()) {
    console.log('[Cloudinary] Skipping remote upload (missing credentials). Storing directly in MongoDB.');
    return imageInput;
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(imageInput, {
      folder: folder,
      resource_type: 'auto'
    });
    console.log('✅ Image uploaded to Cloudinary:', uploadResult.secure_url);
    return uploadResult.secure_url;
  } catch (error) {
    console.warn('⚠️ Cloudinary upload warning:', error.message);
    // Return original image data rather than failing the entire request
    return imageInput;
  }
}

export { cloudinary };
export default uploadToCloudinary;
