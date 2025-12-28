import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT setting_value FROM `hw-settings` WHERE setting_key = 'project_submission_enabled'");
    const enabled = rows[0]?.setting_value === 'true';
    return NextResponse.json({ enabled });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { enabled } = await request.json();
    const value = enabled ? 'true' : 'false';
    await pool.query("INSERT INTO `hw-settings` (setting_key, setting_value) VALUES ('project_submission_enabled', ?) ON DUPLICATE KEY UPDATE setting_value = ?", [value, value]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

