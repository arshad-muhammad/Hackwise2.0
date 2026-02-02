import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${uuidv4()}${path.extname(file.name)}`;
    
    // Check if we're in a serverless environment
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In serverless environments (like Vercel), filesystem is read-only
    // We need to use /tmp or return base64, or use external storage
    let uploadDir, filepath, url;

    if (isVercel || isProduction) {
      // In serverless environments, try to write to /tmp
      // Note: Files in /tmp are ephemeral and won't persist across deployments
      // For production, consider using cloud storage (S3, Cloudinary, Vercel Blob, etc.)
      uploadDir = '/tmp';
      filepath = path.join(uploadDir, filename);
      
      try {
        // Ensure /tmp directory exists
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        await writeFile(filepath, buffer);
        // In serverless, we can't reliably serve from /tmp
        // Return base64 as fallback, but recommend cloud storage
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        return NextResponse.json({ 
          url: dataUrl,
          isBase64: true,
          message: 'File uploaded as base64. For production, consider using cloud storage.'
        });
      } catch (tmpError) {
        console.error('Failed to write to /tmp:', tmpError);
        // Fallback: return base64 directly
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;
        return NextResponse.json({ 
          url: dataUrl,
          isBase64: true,
          message: 'File uploaded as base64 (filesystem not writable). Consider using cloud storage for production.'
        });
      }
    } else {
      // Development: use public/uploads
      uploadDir = path.join(process.cwd(), 'public', 'uploads');
      filepath = path.join(uploadDir, filename);
      
      // Ensure upload directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      await writeFile(filepath, buffer);
      url = `/uploads/${filename}`;
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path,
    });
    
    return NextResponse.json({ 
      error: 'Upload failed. Please try again or contact support.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 });
  }
}

