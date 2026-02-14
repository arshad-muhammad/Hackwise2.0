import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: list certificates (basic fields only)
export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT 
         c.id,
         c.code,
         c.recipient_name,
         c.team_name,
         c.details,
         c.created_at,
         c.template_id,
         t.name AS template_name,
         t.type AS template_type
       FROM \`hw-certificates\` c
       LEFT JOIN \`hw-certificate-templates\` t ON c.template_id = t.id
       ORDER BY c.created_at DESC, c.id DESC`
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
    const { recipient_name, team_name, suffix, details, template_id } = await request.json();

    if (!recipient_name || !suffix) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const normalizedSuffix = String(suffix).trim().toUpperCase();
    if (!normalizedSuffix) {
      return NextResponse.json({ error: 'Invalid code suffix' }, { status: 400 });
    }

    const code = `HW2-2026-${normalizedSuffix}`;

    await pool.query(
      'INSERT INTO `hw-certificates` (code, recipient_name, team_name, details, template_id) VALUES (?, ?, ?, ?, ?)',
      [code, recipient_name, team_name || null, details || null, template_id || null]
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

