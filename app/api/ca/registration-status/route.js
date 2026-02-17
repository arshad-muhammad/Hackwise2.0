import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Public endpoint to check CA registration status
export async function GET(request) {
  try {
    const [settings] = await pool.query(
      `SELECT setting_key, setting_value 
       FROM \`hw-settings\` 
       WHERE setting_key = 'ca_registration_closed'`
    );

    const registrationClosed = settings.length > 0 
      ? settings[0].setting_value === '1' || settings[0].setting_value === 'true'
      : false; // Default to open

    return NextResponse.json({
      registration_closed: registrationClosed,
    });
  } catch (error) {
    console.error('Error fetching registration status:', error);
    // If table doesn't exist, return default (open)
    return NextResponse.json({
      registration_closed: false,
    });
  }
}

