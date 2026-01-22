import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  return handleRedirect(request, resolvedParams);
}

export async function POST(request, { params }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  return handleRedirect(request, resolvedParams);
}

async function handleRedirect(request, params) {
  try {
    const { ca_code } = params;

    if (!ca_code) {
      return NextResponse.json(
        { valid: false, error: 'CA code is required' },
        { status: 400 }
      );
    }

    // Check if CA code exists and is approved (case-insensitive)
    const [applications] = await pool.query(
      `SELECT id, status, ca_code FROM \`hw-ca-applications\` 
       WHERE ca_code IS NOT NULL AND UPPER(TRIM(ca_code)) = UPPER(TRIM(?)) AND status = 'APPROVED'`,
      [ca_code]
    );

    if (applications.length === 0) {
      // Debug: Check if CA code exists at all (for debugging)
      const [allCodes] = await pool.query(
        `SELECT ca_code, status FROM \`hw-ca-applications\` 
         WHERE ca_code IS NOT NULL AND UPPER(TRIM(ca_code)) = UPPER(TRIM(?))`,
        [ca_code]
      );
      
      if (allCodes.length > 0) {
        console.log(`CA code found but status is: ${allCodes[0].status}`);
        return NextResponse.json(
          { 
            valid: false, 
            error: `CA code exists but status is ${allCodes[0].status}, not APPROVED` 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { valid: false, error: 'Invalid or unapproved CA code' },
        { status: 404 }
      );
    }

    const ca = applications[0];

    // Get client IP and user agent for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || null;

    // Log the click
    try {
      await pool.query(
        `INSERT INTO \`hw-ca-clicks\` 
         (ca_id, ca_code, ip_address, user_agent, referrer, clicked_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [ca.id, ca_code, ipAddress, userAgent, referrer]
      );
    } catch (error) {
      // Log error but don't fail the request
      console.error('Error logging CA click:', error);
    }

    return NextResponse.json({
      valid: true,
      ca_code: ca_code,
      message: 'Referral link validated and click logged',
    });
  } catch (error) {
    console.error('Error validating CA redirect:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      ca_code: params?.ca_code
    });
    return NextResponse.json(
      { 
        valid: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

