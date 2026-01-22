import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createCASession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { ca_code, password } = await request.json();

    if (!ca_code || !password) {
      return NextResponse.json(
        { error: 'CA code and password are required' },
        { status: 400 }
      );
    }

    // Verify CA code exists and status is APPROVED
    const [cas] = await pool.query(
      'SELECT id, ca_code, email, name, password_hash FROM `hw-ca-applications` WHERE UPPER(TRIM(ca_code)) = UPPER(TRIM(?)) AND status = "APPROVED"',
      [ca_code]
    );

    if (cas.length === 0) {
      return NextResponse.json(
        { error: 'Invalid CA code or application not approved' },
        { status: 401 }
      );
    }

    const ca = cas[0];

    // Verify password
    if (!ca.password_hash) {
      return NextResponse.json(
        { error: 'Password not set. Please contact admin.' },
        { status: 401 }
      );
    }

    const [salt, hash] = ca.password_hash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    if (verifyHash !== hash) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const token = await createCASession({
      ca_id: ca.id,
      ca_code: ca.ca_code,
      email: ca.email,
      name: ca.name,
    });

    const response = NextResponse.json({ success: true, ca: { name: ca.name, ca_code: ca.ca_code } });

    response.cookies.set('ca_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('CA login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

