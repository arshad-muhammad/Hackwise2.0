import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get('code') || '';

    if (!rawCode.trim()) {
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    const code = rawCode.trim().toUpperCase();

    const [rows] = await pool.query(
      'SELECT id, code, recipient_name, team_name, details, created_at FROM `hw-certificates` WHERE code = ? LIMIT 1',
      [code]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ valid: false, message: 'Certificate not found' }, { status: 404 });
    }

    const cert = rows[0];

    return NextResponse.json({
      valid: true,
      certificate: cert,
    });
  } catch (error) {
    console.error('Error verifying certificate', error);
    return NextResponse.json({ valid: false, error: 'Database error' }, { status: 500 });
  }
}


