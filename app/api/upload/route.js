import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Check if Cloudinary is configured
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    if (!hasCloudName || !hasApiKey || !hasApiSecret) {
      console.error('Cloudinary configuration missing:', {
        hasCloudName,
        hasApiKey,
        hasApiSecret,
        nodeEnv: process.env.NODE_ENV,
      });
      return NextResponse.json({ 
        error: 'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
        code: 'CLOUDINARY_NOT_CONFIGURED',
        details: process.env.NODE_ENV === 'development' ? {
          hasCloudName,
          hasApiKey,
          hasApiSecret,
        } : undefined,
      }, { status: 500 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(buffer, 'hackwise-committee');

      if (!result || !result.url) {
        throw new Error('Cloudinary upload returned invalid response');
      }

      return NextResponse.json({ 
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', {
        message: cloudinaryError.message,
        stack: cloudinaryError.stack,
        name: cloudinaryError.name,
      });
      
      // Provide more helpful error message
      let errorMessage = 'Failed to upload to Cloudinary';
      if (cloudinaryError.message) {
        errorMessage = cloudinaryError.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: cloudinaryError.message,
          stack: cloudinaryError.stack,
        } : 'Check server logs for details',
        code: 'CLOUDINARY_UPLOAD_FAILED'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: 'UPLOAD_ERROR'
    }, { status: 500 });
  }
}

