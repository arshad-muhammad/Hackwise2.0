import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

// GET all committee members
export async function GET() {
  try {
    const [members] = await pool.query(
      `SELECT * FROM \`hw-committee-members\` 
       WHERE is_active = TRUE 
       ORDER BY display_order ASC, created_at ASC`
    );
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST create new committee member
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      bio,
      email,
      linkedin_url,
      github_url,
      twitter_url,
      portfolio_url,
      image_url,
      display_order,
    } = body;

    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO \`hw-committee-members\`
       (name, role, bio, email, linkedin_url, github_url, twitter_url, portfolio_url, image_url, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        role,
        bio || null,
        email || null,
        linkedin_url || null,
        github_url || null,
        twitter_url || null,
        portfolio_url || null,
        image_url || null,
        display_order || 0,
      ]
    );

    await logAction('INFO', `Committee member created: ${name}`, {
      member_id: result.insertId,
      name,
      role,
    });

    return NextResponse.json({
      success: true,
      member: { id: result.insertId, ...body },
    });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT update committee member
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      role,
      bio,
      email,
      linkedin_url,
      github_url,
      twitter_url,
      portfolio_url,
      image_url,
      display_order,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE \`hw-committee-members\`
       SET name = ?, role = ?, bio = ?, email = ?, linkedin_url = ?,
           github_url = ?, twitter_url = ?, portfolio_url = ?, image_url = ?,
           display_order = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        role,
        bio || null,
        email || null,
        linkedin_url || null,
        github_url || null,
        twitter_url || null,
        portfolio_url || null,
        image_url || null,
        display_order || 0,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    await logAction('INFO', `Committee member updated: ${id}`, {
      member_id: id,
      updates: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE committee member
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await pool.query('DELETE FROM `hw-committee-members` WHERE id = ?', [id]);

    await logAction('WARN', `Committee member deleted: ${id}`, {
      member_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

