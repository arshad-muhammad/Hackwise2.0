import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Fetch CA settings
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from database (create table if needed)
    const [settings] = await pool.query(
      `SELECT setting_key, setting_value 
       FROM \`hw-settings\` 
       WHERE setting_key = 'ca_leaderboard_visible'`
    );

    const leaderboardVisible = settings.length > 0 
      ? settings[0].setting_value === '1' || settings[0].setting_value === 'true'
      : true; // Default to visible

    return NextResponse.json({
      ca_leaderboard_visible: leaderboardVisible,
    });
  } catch (error) {
    console.error('Error fetching CA settings:', error);
    // If table doesn't exist, return default
    return NextResponse.json({
      ca_leaderboard_visible: true,
    });
  }
}

// PUT: Update CA settings
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ca_leaderboard_visible } = body;

    if (typeof ca_leaderboard_visible !== 'boolean') {
      return NextResponse.json(
        { error: 'ca_leaderboard_visible must be a boolean' },
        { status: 400 }
      );
    }

    // Settings table already exists (created in db-setup.js)
    // Structure: setting_key (VARCHAR(50) PRIMARY KEY), setting_value (TEXT), updated_at (TIMESTAMP)

    // Insert or update setting
    await pool.query(
      `INSERT INTO \`hw-settings\` (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [
        'ca_leaderboard_visible',
        ca_leaderboard_visible ? '1' : '0',
        ca_leaderboard_visible ? '1' : '0',
      ]
    );

    // Log the change
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'CA Settings Updated',
        JSON.stringify({ ca_leaderboard_visible }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      ca_leaderboard_visible,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating CA settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

