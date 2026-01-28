import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: list certificates (basic fields only)
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, code, recipient_name, team_name, details, created_at FROM `hw-certificates` ORDER BY created_at DESC, id DESC'
    );
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('Error fetching certificates', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST: create a new certificate code
export async function POST(request) {
  try {
    const { recipient_name, team_name, suffix, details } = await request.json();

    if (!recipient_name || !suffix) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const normalizedSuffix = String(suffix).trim().toUpperCase();
    if (!normalizedSuffix) {
      return NextResponse.json({ error: 'Invalid code suffix' }, { status: 400 });
    }

    const code = `HW2-2026-${normalizedSuffix}`;

    await pool.query(
      'INSERT INTO `hw-certificates` (code, recipient_name, team_name, details) VALUES (?, ?, ?, ?)',
      [code, recipient_name, team_name || null, details || null]
    );

    return NextResponse.json({ success: true, code });
  } catch (error) {
    console.error('Error creating certificate', error);
    // Handle duplicate code gracefully
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'A certificate with this code already exists. Try a different suffix.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT: update certificate meta (not code)
export async function PUT(request) {
  try {
    const { id, recipient_name, team_name, details } = await request.json();

    if (!id || !recipient_name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await pool.query(
      'UPDATE `hw-certificates` SET recipient_name = ?, team_name = ?, details = ? WHERE id = ?',
      [recipient_name, team_name || null, details || null, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating certificate', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE: remove a certificate
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await pool.query('DELETE FROM `hw-certificates` WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

