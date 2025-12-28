import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function POST(request) {
  try {
    const { title, message, target_team_id } = await request.json();
    
    await pool.query(
      'INSERT INTO `hw-announcements` (title, message, target_team_id) VALUES (?, ?, ?)',
      [title, message, target_team_id || null]
    );

    await logAction('INFO', `Announcement created: ${title}`, { title, target_team_id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, message } = body;

    if (!id) return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });

    await pool.query(
      'UPDATE `hw-announcements` SET title = ?, message = ? WHERE id = ?',
      [title, message, id]
    );

    await logAction('INFO', `Announcement updated: ${id}`, { id, title });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Announcement ID required' }, { status: 400 });

    await pool.query('DELETE FROM `hw-announcements` WHERE id = ?', [id]);

    await logAction('WARN', `Announcement deleted: ${id}`, { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, t.team_name 
      FROM \`hw-announcements\` a
      LEFT JOIN \`hw-teams\` t ON a.target_team_id = t.id
      ORDER BY a.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
