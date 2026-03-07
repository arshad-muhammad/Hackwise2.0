import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await pool.query(
      "SELECT setting_value FROM `hw-settings` WHERE setting_key = 'payment_window_closed'"
    );
    const closed = rows[0]?.setting_value === 'true';

    return NextResponse.json({ closed });
  } catch (error) {
    console.error('Error fetching payment window setting:', error);
    return NextResponse.json({ closed: false });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { closed } = await request.json();
    const value = closed ? 'true' : 'false';

    await pool.query(
      "INSERT INTO `hw-settings` (setting_key, setting_value) VALUES ('payment_window_closed', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [value, value]
    );

    return NextResponse.json({ success: true, closed });
  } catch (error) {
    console.error('Error updating payment window setting:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
