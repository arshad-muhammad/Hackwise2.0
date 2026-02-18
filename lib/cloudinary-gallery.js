import { v2 as cloudinary } from 'cloudinary';

// Separate Cloudinary configuration for Gallery
const galleryCloudName = process.env.GALLERY_CLOUDINARY_CLOUD_NAME;
const galleryApiKey = process.env.GALLERY_CLOUDINARY_API_KEY;
const galleryApiSecret = process.env.GALLERY_CLOUDINARY_API_SECRET;

// Create a separate Cloudinary instance for gallery
// We'll use the same cloudinary object but with different config
// The config will be set per-request to avoid conflicts

/**
 * Upload media to Gallery Cloudinary
 * @param {Buffer} buffer - Media buffer
 * @param {string} resourceType - 'image' or 'video'
 * @param {string} folder - Folder path in Cloudinary (optional)
 * @returns {Promise<Object>} Upload result with secure_url
 */
export async function uploadGalleryMedia(buffer, resourceType = 'image', folder = 'hackwise-gallery') {
  if (!galleryCloudName || !galleryApiKey || !galleryApiSecret) {
    throw new Error('Gallery Cloudinary is not configured. Please set GALLERY_CLOUDINARY_CLOUD_NAME, GALLERY_CLOUDINARY_API_KEY, and GALLERY_CLOUDINARY_API_SECRET environment variables.');
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid media buffer: buffer is empty');
  }

  const maxSize = resourceType === 'video' ? 30 * 1024 * 1024 : 10 * 1024 * 1024; // 30MB for video, 10MB for image
  if (buffer.length > maxSize) {
    throw new Error(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }

  // Configure cloudinary for this request
  cloudinary.config({
    cloud_name: galleryCloudName,
    api_key: galleryApiKey,
    api_secret: galleryApiSecret,
  });

  // Convert buffer to base64 data URI
  const base64Media = buffer.toString('base64');
  const mimeType = resourceType === 'video' ? 'video/mp4' : 'image/jpeg';
  const dataUri = `data:${mimeType};base64,${base64Media}`;

  const uploadOptions = {
    folder,
    resource_type: resourceType,
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  try {
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    if (!result || !result.secure_url) {
      throw new Error('Gallery Cloudinary upload returned invalid response');
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Gallery Cloudinary upload error:', error);
    throw new Error(`Gallery Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Delete media from Gallery Cloudinary
 * @param {string} publicId - Public ID of the media to delete
 * @param {string} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteGalleryMedia(publicId, resourceType = 'image') {
  if (!galleryCloudName || !galleryApiKey || !galleryApiSecret) {
    throw new Error('Gallery Cloudinary is not configured.');
  }

  // Configure cloudinary for this request
  cloudinary.config({
    cloud_name: galleryCloudName,
    api_key: galleryApiKey,
    api_secret: galleryApiSecret,
  });

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Gallery Cloudinary:', error);
    throw error;
  }
}

/**
 * Get optimized URL for gallery media
 * @param {string} publicId - Public ID
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export function getGalleryMediaUrl(publicId, options = {}) {
  if (!galleryCloudName) {
    throw new Error('Gallery Cloudinary is not configured.');
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  const transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  const transformationString = transformations.join(',');
  return `https://res.cloudinary.com/${galleryCloudName}/image/upload/${transformationString}/${publicId}`;
}

export default cloudinary;

