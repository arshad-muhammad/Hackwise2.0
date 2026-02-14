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
      `SELECT 
         c.id,
         c.code,
         c.recipient_name,
         c.team_name,
         c.details,
         c.created_at,
         c.template_id,
         t.name AS template_name,
         t.type AS template_type,
         t.image_url AS template_image_url,
         t.image_width AS template_image_width,
         t.image_height AS template_image_height,
         t.config AS template_config
       FROM \`hw-certificates\` c
       LEFT JOIN \`hw-certificate-templates\` t ON c.template_id = t.id
       WHERE c.code = ?
       LIMIT 1`,
      [code]
    );

    if (!rows || rows.length === 0) {
      await logAction('WARN', 'Certificate verification failed - not found', {
        type: 'CERT_VERIFY',
        code,
      });
      return NextResponse.json({ valid: false, message: 'Certificate not found' }, { status: 404 });
    }

    const row = rows[0];

    let templateConfig = null;
    try {
      if (row.template_config && typeof row.template_config === 'string') {
        templateConfig = JSON.parse(row.template_config);
      } else {
        templateConfig = row.template_config || null;
      }
    } catch {
      templateConfig = null;
    }

    const cert = {
      id: row.id,
      code: row.code,
      recipient_name: row.recipient_name,
      team_name: row.team_name,
      details: row.details,
      created_at: row.created_at,
      template_id: row.template_id,
      template_name: row.template_name,
      template_type: row.template_type,
      template_image_url: row.template_image_url,
      template_image_width: row.template_image_width,
      template_image_height: row.template_image_height,
      template_config: templateConfig,
    };

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


