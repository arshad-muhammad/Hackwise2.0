import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET - Get all gallery media (including unapproved) for admin
export async function GET(request) {
  try {
    // Verify admin session
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status'); // 'approved', 'pending', or null for all

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
        uploaded_by,
        file_size,
        width,
        height,
        duration,
        created_at
      FROM \`hw-gallery-media\`
      WHERE 1=1
    `;

    const queryParams = [];

    if (status === 'approved') {
      query += ' AND is_approved = TRUE';
    } else if (status === 'pending') {
      query += ' AND is_approved = FALSE';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [media] = await pool.execute(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM `hw-gallery-media` WHERE 1=1';
    const countParams = [];

    if (status === 'approved') {
      countQuery += ' AND is_approved = TRUE';
    } else if (status === 'pending') {
      countQuery += ' AND is_approved = FALSE';
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin gallery media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery media' },
      { status: 500 }
    );
  }
}

// PUT - Update media (approve, feature, etc.)
export async function PUT(request) {
  try {
    // Verify admin session
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_approved, is_featured, category } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const updates = [];
    const values = [];

    if (is_approved !== undefined) {
      updates.push('is_approved = ?');
      values.push(is_approved);
    }

    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      values.push(is_featured);
    }

    if (category) {
      updates.push('category = ?');
      values.push(category);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    values.push(id);

    await pool.execute(
      `UPDATE \`hw-gallery-media\` SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: 'Media updated successfully',
    });
  } catch (error) {
    console.error('Error updating gallery media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

