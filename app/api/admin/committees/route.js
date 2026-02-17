import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

// GET all committees
export async function GET() {
  try {
    const [committees] = await pool.query(
      `SELECT * FROM \`hw-committees\` 
       ORDER BY display_order ASC, created_at ASC`
    );
    return NextResponse.json({ committees });
  } catch (error) {
    console.error('Get committees error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST create new committee
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      display_order,
      is_active,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Committee name is required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      `INSERT INTO \`hw-committees\`
       (name, description, display_order, is_active)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        description || null,
        display_order || 0,
        is_active !== undefined ? is_active : true,
      ]
    );

    await logAction('INFO', `Committee created: ${name}`, {
      committee_id: result.insertId,
      name,
    });

    return NextResponse.json({
      success: true,
      committee: { id: result.insertId, ...body },
    });
  } catch (error) {
    console.error('Create committee error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT update committee
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      display_order,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Committee ID required' }, { status: 400 });
    }

    await pool.query(
      `UPDATE \`hw-committees\`
       SET name = ?, description = ?, display_order = ?, is_active = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        display_order || 0,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    await logAction('INFO', `Committee updated: ${id}`, {
      committee_id: id,
      updates: body,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update committee error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE committee
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Committee ID required' }, { status: 400 });
    }

    // Set committee_id to NULL for all members in this committee
    await pool.query(
      'UPDATE `hw-committee-members` SET committee_id = NULL WHERE committee_id = ?',
      [id]
    );

    await pool.query('DELETE FROM `hw-committees` WHERE id = ?', [id]);

    await logAction('WARN', `Committee deleted: ${id}`, {
      committee_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete committee error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

