import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { uploadGalleryMedia, deleteGalleryMedia } from '@/lib/cloudinary-gallery';

// GET - Fetch gallery media with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'All';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const featured = searchParams.get('featured') === 'true';
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id,
        cloudinary_public_id,
        cloudinary_url,
        media_type,
        caption,
        category,
        team_name,
        is_featured,
        is_approved,
        width,
        height,
        duration,
        created_at
      FROM \`hw-gallery-media\`
      WHERE is_approved = TRUE
    `;

    const queryParams = [];

    if (featured) {
      query += ' AND is_featured = TRUE';
    }

    if (category && category !== 'All') {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [media] = await pool.execute(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM `hw-gallery-media` WHERE is_approved = TRUE';
    const countParams = [];

    if (featured) {
      countQuery += ' AND is_featured = TRUE';
    }

    if (category && category !== 'All') {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Get total count for stats
    const [statsResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM `hw-gallery-media` WHERE is_approved = TRUE'
    );
    const totalMedia = statsResult[0]?.total || 0;

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalMedia,
      },
    });
  } catch (error) {
    console.error('Error fetching gallery media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery media', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Upload new media
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const caption = formData.get('caption') || '';
    const category = formData.get('category') || 'Hackathon';
    const teamName = formData.get('teamName') || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    
    // Get file extension as fallback if MIME type is not available
    const fileName = file.name || '';
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const videoExtensions = ['mp4', 'webm'];
    
    const isImage = allowedImageTypes.includes(file.type) || imageExtensions.includes(fileExtension);
    const isVideo = allowedVideoTypes.includes(file.type) || videoExtensions.includes(fileExtension);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { 
          error: 'Invalid file type. Allowed: jpg, png, webp, mp4, webm',
          receivedType: file.type,
          receivedExtension: fileExtension
        },
        { status: 400 }
      );
    }

    // Validate file size
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 30 * 1024 * 1024; // 30MB
    const maxSize = isImage ? maxImageSize : maxVideoSize;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Check Gallery Cloudinary config
    const hasGalleryCloudName = !!process.env.GALLERY_CLOUDINARY_CLOUD_NAME;
    const hasGalleryApiKey = !!process.env.GALLERY_CLOUDINARY_API_KEY;
    const hasGalleryApiSecret = !!process.env.GALLERY_CLOUDINARY_API_SECRET;

    if (!hasGalleryCloudName || !hasGalleryApiKey || !hasGalleryApiSecret) {
      return NextResponse.json(
        { error: 'Gallery Cloudinary is not configured' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const resourceType = isImage ? 'image' : 'video';
    
    let uploadResult;
    try {
      uploadResult = await uploadGalleryMedia(buffer, resourceType);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return NextResponse.json(
        { 
          error: cloudinaryError.message || 'Failed to upload to Cloudinary',
          details: process.env.NODE_ENV === 'development' ? cloudinaryError.stack : undefined
        },
        { status: 500 }
      );
    }

    // Save to database
    let result;
    try {
      [result] = await pool.execute(
        `INSERT INTO \`hw-gallery-media\` 
         (cloudinary_public_id, cloudinary_url, media_type, caption, category, team_name, file_size, width, height, duration, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
        [
          uploadResult.public_id,
          uploadResult.url,
          resourceType,
          caption,
          category,
          teamName || null,
          uploadResult.bytes,
          uploadResult.width || null,
          uploadResult.height || null,
          uploadResult.duration || null,
        ]
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Try to delete from Cloudinary if database insert fails
      try {
        await deleteGalleryMedia(uploadResult.public_id, resourceType);
      } catch (deleteError) {
        console.error('Error cleaning up Cloudinary:', deleteError);
      }
      return NextResponse.json(
        { 
          error: 'Failed to save media to database',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: {
        id: result.insertId,
        cloudinary_public_id: uploadResult.public_id,
        cloudinary_url: uploadResult.url,
        media_type: resourceType,
        caption,
        category,
        team_name: teamName,
        is_approved: false,
      },
      message: 'Upload successful. Pending admin approval.',
    });
  } catch (error) {
    console.error('Error uploading gallery media:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to upload media',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete media (admin only)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Get media info before deletion
    const [media] = await pool.execute(
      'SELECT cloudinary_public_id, media_type FROM `hw-gallery-media` WHERE id = ?',
      [id]
    );

    if (media.length === 0) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    const { cloudinary_public_id, media_type } = media[0];

    // Delete from Cloudinary
    try {
      await deleteGalleryMedia(cloudinary_public_id, media_type);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await pool.execute('DELETE FROM `hw-gallery-media` WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting gallery media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}

