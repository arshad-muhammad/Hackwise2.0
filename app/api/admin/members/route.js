import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, college, branch, year, role } = body;

    if (!id) {
        return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE \`hw-team-members\` 
       SET name = ?, email = ?, phone = ?, college = ?, branch = ?, year = ?, role = ?
       WHERE id = ?`,
      [name, email, phone, college, branch, year, role, id]
    );

    await logAction('INFO', `Member updated (Admin): ${id}`, { member_id: id, updates: body });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    }

    await pool.query('DELETE FROM `hw-team-members` WHERE id = ?', [id]);

    await logAction('WARN', `Member deleted (Admin): ${id}`, { member_id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

