import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Public endpoint to check main hackathon registration status
export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM `hw-settings` WHERE setting_key = 'registration_closed'"
    );

    const closed = rows[0]?.setting_value === 'true';

    return NextResponse.json({
      registration_closed: closed,
    });
  } catch (error) {
    console.error('Error fetching main registration status:', error);
    // Fail-safe: treat as open if settings are not readable
    return NextResponse.json({
      registration_closed: false,
    });
  }
}


