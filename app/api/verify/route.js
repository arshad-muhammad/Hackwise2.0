import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCode = searchParams.get('code') || '';

    if (!rawCode.trim()) {
      await logAction('WARN', 'Certificate verification attempted without code', {
        type: 'CERT_VERIFY',
        rawCode,
      });
      return NextResponse.json({ valid: false, error: 'Code is required' }, { status: 400 });
    }

    const code = rawCode.trim().toUpperCase();

    const [rows] = await pool.query(
      'SELECT id, code, recipient_name, team_name, details, created_at FROM `hw-certificates` WHERE code = ? LIMIT 1',
      [code]
    );

    if (!rows || rows.length === 0) {
      await logAction('WARN', 'Certificate verification failed - not found', {
        type: 'CERT_VERIFY',
        code,
      });
      return NextResponse.json({ valid: false, message: 'Certificate not found' }, { status: 404 });
    }

    const cert = rows[0];

    await logAction('INFO', 'Certificate verification success', {
      type: 'CERT_VERIFY',
      code: cert.code,
      recipient_name: cert.recipient_name,
      team_name: cert.team_name,
    });

    return NextResponse.json({
      valid: true,
      certificate: cert,
    });
  } catch (error) {
    console.error('Error verifying certificate', error);
    await logAction('ERROR', 'Certificate verification error', {
      type: 'CERT_VERIFY',
      error: error.message,
    });
    return NextResponse.json({ valid: false, error: 'Database error' }, { status: 500 });
  }
}


