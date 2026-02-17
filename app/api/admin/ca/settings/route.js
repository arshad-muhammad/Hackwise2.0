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
       WHERE setting_key IN ('ca_leaderboard_visible', 'ca_registration_closed')`
    );

    const settingsMap = {};
    settings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });

    const leaderboardVisible = settingsMap['ca_leaderboard_visible']
      ? settingsMap['ca_leaderboard_visible'] === '1' || settingsMap['ca_leaderboard_visible'] === 'true'
      : true; // Default to visible

    const registrationClosed = settingsMap['ca_registration_closed']
      ? settingsMap['ca_registration_closed'] === '1' || settingsMap['ca_registration_closed'] === 'true'
      : false; // Default to open

    return NextResponse.json({
      ca_leaderboard_visible: leaderboardVisible,
      ca_registration_closed: registrationClosed,
    });
  } catch (error) {
    console.error('Error fetching CA settings:', error);
    // If table doesn't exist, return default
    return NextResponse.json({
      ca_leaderboard_visible: true,
      ca_registration_closed: false,
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
    const { ca_leaderboard_visible, ca_registration_closed } = body;

    // Update leaderboard visibility if provided
    if (typeof ca_leaderboard_visible === 'boolean') {
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
    }

    // Update registration status if provided
    if (typeof ca_registration_closed === 'boolean') {
      await pool.query(
        `INSERT INTO \`hw-settings\` (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [
          'ca_registration_closed',
          ca_registration_closed ? '1' : '0',
          ca_registration_closed ? '1' : '0',
        ]
      );
    }

    // Log the change
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'CA Settings Updated',
        JSON.stringify({ ca_leaderboard_visible, ca_registration_closed }),
      ]
    ).catch(console.error);

    // Fetch updated settings to return
    const [updatedSettings] = await pool.query(
      `SELECT setting_key, setting_value 
       FROM \`hw-settings\` 
       WHERE setting_key IN ('ca_leaderboard_visible', 'ca_registration_closed')`
    );

    const settingsMap = {};
    updatedSettings.forEach(setting => {
      settingsMap[setting.setting_key] = setting.setting_value;
    });

    const leaderboardVisible = settingsMap['ca_leaderboard_visible']
      ? settingsMap['ca_leaderboard_visible'] === '1' || settingsMap['ca_leaderboard_visible'] === 'true'
      : true;

    const registrationClosed = settingsMap['ca_registration_closed']
      ? settingsMap['ca_registration_closed'] === '1' || settingsMap['ca_registration_closed'] === 'true'
      : false;

    return NextResponse.json({
      success: true,
      ca_leaderboard_visible: leaderboardVisible,
      ca_registration_closed: registrationClosed,
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

