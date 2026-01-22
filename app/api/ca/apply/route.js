import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      college,
      college_abbreviation,
      branch,
      year,
      why_interested,
      previous_experience,
      social_media_links,
      password,
    } = body;

    // Validation: Required fields
    if (!name || !email || !phone || !college || !why_interested || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Phone validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Check for duplicate applications by email or phone
    const [existingByEmail] = await pool.query(
      'SELECT id, status FROM `hw-ca-applications` WHERE email = ?',
      [email]
    );

    if (existingByEmail.length > 0) {
      const existing = existingByEmail[0];
      if (existing.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'An application with this email already exists and has been approved' },
          { status: 409 }
        );
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: 'An application with this email is already pending review' },
          { status: 409 }
        );
      }
      // If REJECTED, allow reapplication
    }

    const [existingByPhone] = await pool.query(
      'SELECT id, status FROM `hw-ca-applications` WHERE phone = ?',
      [cleanPhone]
    );

    if (existingByPhone.length > 0) {
      const existing = existingByPhone[0];
      if (existing.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'An application with this phone number already exists and has been approved' },
          { status: 409 }
        );
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: 'An application with this phone number is already pending review' },
          { status: 409 }
        );
      }
    }

    // Hash password using PBKDF2
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    // Insert application with PENDING status
    const [result] = await pool.query(
      `INSERT INTO \`hw-ca-applications\` 
       (name, email, phone, college, college_abbreviation, branch, year, why_interested, previous_experience, social_media_links, password_hash, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        name,
        email,
        cleanPhone,
        college,
        college_abbreviation || null,
        branch || null,
        year || null,
        why_interested,
        previous_experience || null,
        JSON.stringify(social_media_links || {}),
        passwordHash,
      ]
    );

    // Log the application
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'New CA Application Submitted',
        JSON.stringify({ id: result.insertId, email, college }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      id: result.insertId,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('CA application error:', error);

    // Handle MySQL duplicate key errors
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('email')) {
        return NextResponse.json(
          { error: 'An application with this email already exists' },
          { status: 409 }
        );
      }
      if (error.sqlMessage.includes('phone')) {
        return NextResponse.json(
          { error: 'An application with this phone number already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

