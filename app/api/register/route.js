import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { team_name, ca_code, members } = body;

    // Validation
    if (!team_name || !members || members.length < 2 || members.length > 4) {
      return NextResponse.json(
        { error: 'Team name and 2-4 members are required' },
        { status: 400 }
      );
    }

    // Validate CA code if provided
    let caId = null;
    if (ca_code && ca_code.trim()) {
      const [cas] = await pool.query(
        'SELECT id FROM `hw-ca-applications` WHERE UPPER(TRIM(ca_code)) = UPPER(TRIM(?)) AND status = "APPROVED"',
        [ca_code.trim()]
      );
      if (cas.length > 0) {
        caId = cas[0].id;
      }
      // If CA code provided but not found, still allow registration (just won't be linked)
    }

    // Validate all members
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (!member.first_name || !member.email || !member.mobile || !member.institute_name) {
        return NextResponse.json(
          { error: `Missing required fields for team member ${i + 1}` },
          { status: 400 }
        );
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) {
        return NextResponse.json(
          { error: `Invalid email for team member ${i + 1}` },
          { status: 400 }
        );
      }

      // Mobile validation
      const cleanMobile = member.mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10) {
        return NextResponse.json(
          { error: `Invalid mobile number for team member ${i + 1}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate emails
    const emails = members.map(m => m.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      return NextResponse.json(
        { error: 'Duplicate email addresses are not allowed' },
        { status: 400 }
      );
    }

    // Check if team name already exists
    const [existingTeam] = await pool.query(
      'SELECT id FROM `hw-participant-registrations` WHERE team_name = ?',
      [team_name]
    );

    if (existingTeam.length > 0) {
      return NextResponse.json(
        { error: 'Team name already exists. Please choose a different name.' },
        { status: 409 }
      );
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert registration
      const [regResult] = await connection.query(
        `INSERT INTO \`hw-participant-registrations\`
         (ca_id, ca_code, team_name, is_verified)
         VALUES (?, ?, ?, TRUE)`,
        [caId, ca_code && ca_code.trim() ? ca_code.trim().toUpperCase() : null, team_name]
      );

      const registrationId = regResult.insertId;

      // Insert team members
      for (const member of members) {
        const cleanMobile = member.mobile.replace(/\D/g, '');
        await connection.query(
          `INSERT INTO \`hw-participant-members\`
           (registration_id, first_name, last_name, email, mobile, gender, location,
            institute_name, user_type, domain, course, course_specialization,
            graduating_year, course_duration, is_team_lead)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            registrationId,
            member.first_name,
            member.last_name || null,
            member.email,
            cleanMobile,
            member.gender || null,
            member.location || null,
            member.institute_name,
            member.user_type || null,
            member.domain || null,
            member.course || null,
            member.course_specialization || null,
            member.graduating_year || null,
            member.course_duration || null,
            member.is_team_lead ? 1 : 0,
          ]
        );
      }

      // Update CA verified_registrations count if CA code was provided
      if (caId) {
        await connection.query(
          `UPDATE \`hw-ca-applications\`
           SET verified_registrations = verified_registrations + 1
           WHERE id = ?`,
          [caId]
        );
      }

      await connection.commit();

      // Log registration
      pool.query(
        'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
        [
          'INFO',
          'New Team Registration',
          JSON.stringify({ registration_id: registrationId, team_name, ca_code, member_count: members.length }),
        ]
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        registration_id: registrationId,
        message: 'Team registered successfully',
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('email')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (error.sqlMessage.includes('team_name')) {
        return NextResponse.json(
          { error: 'Team name already exists' },
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

