import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Read main hackathon registration open/closed status
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await pool.query(
      "SELECT setting_value FROM `hw-settings` WHERE setting_key = 'registration_closed'"
    );
    const closed = rows[0]?.setting_value === 'true';

    return NextResponse.json({ closed });
  } catch (error) {
    console.error('Error fetching registration setting:', error);
    return NextResponse.json({ closed: false });
  }
}

// POST: Update main hackathon registration status
export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { closed } = await request.json();
    const value = closed ? 'true' : 'false';

    await pool.query(
      "INSERT INTO `hw-settings` (setting_key, setting_value) VALUES ('registration_closed', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [value, value]
    );

    return NextResponse.json({ success: true, closed });
  } catch (error) {
    console.error('Error updating registration setting:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
}


