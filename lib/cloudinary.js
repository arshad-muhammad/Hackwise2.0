import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with validation
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
} else {
  console.warn('Cloudinary configuration incomplete. Missing:', {
    cloudName: !cloudName,
    apiKey: !apiKey,
    apiSecret: !apiSecret,
  });
}

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Folder path in Cloudinary (optional)
 * @param {string} publicId - Public ID for the image (optional, will be auto-generated if not provided)
 * @returns {Promise<Object>} Upload result with secure_url
 */
export async function uploadToCloudinary(buffer, folder = 'hackwise-committee', publicId = null) {
  // Check if Cloudinary is configured
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  // Validate buffer
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid image buffer: buffer is empty');
  }

  if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Image file is too large. Maximum size is 10MB');
  }

  // Convert buffer to base64 data URI for upload
  const base64Image = buffer.toString('base64');
  const dataUri = `data:image/jpeg;base64,${base64Image}`;

  const uploadOptions = {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  try {
    // Use upload method instead of upload_stream for better error handling
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    if (!result || !result.secure_url) {
      console.error('Cloudinary upload returned invalid result:', result);
      throw new Error('Cloudinary upload returned invalid response');
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      error: error,
    });

    // Provide more specific error messages
    let errorMessage = 'Cloudinary upload failed';
    if (error.http_code === 401) {
      errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
    } else if (error.http_code === 400) {
      errorMessage = `Cloudinary upload failed: ${error.message || 'Invalid request'}`;
    } else if (error.http_code === 500) {
      errorMessage = 'Cloudinary server error. Please check your credentials and try again.';
    } else if (error.message) {
      errorMessage = `Cloudinary upload failed: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

export default cloudinary;

