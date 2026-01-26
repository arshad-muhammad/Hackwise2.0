import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Fetch all CA registrations with optional filtering
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ca_id = searchParams.get('ca_id');
    const is_verified = searchParams.get('is_verified');
    const search = searchParams.get('search');

    let query = `
      SELECT 
        r.id, r.ca_id, r.ca_code,
        r.participant_name, r.participant_email, r.participant_phone,
        r.team_name, r.unstop_registration_id, r.registration_date,
        r.is_verified, r.is_self_registration, r.verification_notes,
        r.verified_at, r.verified_by,
        r.created_at, r.updated_at,
        ca.name as ca_name, ca.email as ca_email
      FROM \`hw-ca-registrations\` r
      LEFT JOIN \`hw-ca-applications\` ca ON r.ca_id = ca.id
      WHERE 1=1
    `;
    const params = [];

    if (ca_id) {
      query += ' AND r.ca_id = ?';
      params.push(ca_id);
    }

    if (is_verified !== null && is_verified !== '') {
      query += ' AND r.is_verified = ?';
      params.push(is_verified === 'true' ? 1 : 0);
    }

    if (search) {
      query += ` AND (
        r.participant_name LIKE ? OR 
        r.participant_email LIKE ? OR 
        r.ca_code LIKE ? OR
        r.unstop_registration_id LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY r.created_at DESC';

    const [registrations] = await pool.query(query, params);

    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Error fetching CA registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Import registrations from Unstop export
export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { registrations } = body; // Array of registration objects

    if (!Array.isArray(registrations) || registrations.length === 0) {
      return NextResponse.json(
        { error: 'Invalid registrations data' },
        { status: 400 }
      );
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (const reg of registrations) {
      try {
        const {
          participant_name,
          participant_email,
          participant_phone,
          team_name,
          unstop_registration_id,
          registration_date,
          ca_code,
        } = reg;

        // Validate required fields
        if (!participant_email || !unstop_registration_id) {
          results.errors.push({
            registration: reg,
            error: 'Missing required fields (email or unstop_registration_id)',
          });
          results.skipped++;
          continue;
        }

        // Check for duplicate unstop_registration_id
        const [existing] = await pool.query(
          'SELECT id FROM `hw-ca-registrations` WHERE unstop_registration_id = ?',
          [unstop_registration_id]
        );

        if (existing.length > 0) {
          results.skipped++;
          continue; // Skip duplicates
        }

        // Find CA by code
        let caId = null;
        if (ca_code) {
          const [ca] = await pool.query(
            'SELECT id, email FROM `hw-ca-applications` WHERE ca_code = ? AND status = "APPROVED"',
            [ca_code]
          );
          if (ca.length > 0) {
            caId = ca[0].id;
            // Check for self-registration
            const isSelfRegistration = ca[0].email.toLowerCase() === participant_email.toLowerCase();
            reg.is_self_registration = isSelfRegistration;
          }
        }

        // Auto-verify if CA code is valid and not self-registration
        const shouldAutoVerify = caId && !reg.is_self_registration;

        // Insert registration
        await pool.query(
          `INSERT INTO \`hw-ca-registrations\`
           (ca_id, ca_code, participant_name, participant_email, participant_phone,
            team_name, unstop_registration_id, registration_date, is_verified, is_self_registration)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            caId,
            ca_code || null,
            participant_name || null,
            participant_email,
            participant_phone || null,
            team_name || null,
            unstop_registration_id,
            registration_date ? new Date(registration_date) : null,
            shouldAutoVerify ? 1 : 0, // Auto-verify if valid CA and not self-registration
            reg.is_self_registration || false,
          ]
        );

        // If auto-verified, recalculate CA performance based on unique teams
        if (shouldAutoVerify && caId) {
          // Count unique teams from hw-participant-registrations (direct registrations)
          // Using TRIM to handle empty strings and ensuring team_name is not empty
          const [directTeams] = await pool.query(
            `SELECT COUNT(DISTINCT team_name) as team_count
             FROM \`hw-participant-registrations\`
             WHERE ca_id = ? AND is_verified = 1 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
            [caId]
          );

          // Count unique teams from hw-ca-registrations (Unstop imports)
          const [unstopTeams] = await pool.query(
            `SELECT COUNT(DISTINCT team_name) as team_count
             FROM \`hw-ca-registrations\`
             WHERE ca_id = ? AND is_verified = 1 AND is_self_registration = 0 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
            [caId]
          );

          const directTeamCount = parseInt(directTeams[0]?.team_count || 0, 10);
          const unstopTeamCount = parseInt(unstopTeams[0]?.team_count || 0, 10);
          const totalTeams = directTeamCount + unstopTeamCount;

          console.log(`[CA Score Calc - Import] CA ID: ${caId}, Direct Teams: ${directTeamCount}, Unstop Teams: ${unstopTeamCount}, Total Teams: ${totalTeams}`);

          // Update verified_registrations count (should be number of unique teams)
          await pool.query(
            `UPDATE \`hw-ca-applications\`
             SET verified_registrations = ?
             WHERE id = ?`,
            [totalTeams, caId]
          );

          // Recalculate performance score (10 points per team + task points)
          // Get sum of all points awarded from approved task submissions (includes early bonus)
          const [taskPoints] = await pool.query(
            `SELECT COALESCE(SUM(points_awarded), 0) as total_task_points
             FROM \`hw-ca-task-submissions\`
             WHERE ca_id = ? AND status = 'APPROVED'`,
            [caId]
          );

          const totalTaskPoints = parseInt(taskPoints[0]?.total_task_points || 0, 10);
          // Scoring: 10 points per team + actual points from approved tasks (including early bonus)
          const performanceScore = (totalTeams * 10) + totalTaskPoints;
          
          console.log(`[CA Score Calc - Import] CA ID: ${caId}, Total Teams: ${totalTeams}, Task Points: ${totalTaskPoints}, Performance Score: ${performanceScore}`);
          
          await pool.query(
            `UPDATE \`hw-ca-applications\`
             SET performance_score = ?
             WHERE id = ?`,
            [performanceScore, caId]
          );
        }

        results.imported++;
      } catch (error) {
        console.error('Error importing registration:', error);
        results.errors.push({
          registration: reg,
          error: error.message,
        });
        results.skipped++;
      }
    }

    // Log import
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'CA Registrations Imported',
        JSON.stringify({ imported: results.imported, skipped: results.skipped }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Error importing registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Verify or reject a registration
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, is_verified, verification_notes } = body;

    if (!id || typeof is_verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current registration
    const [registrations] = await pool.query(
      'SELECT * FROM `hw-ca-registrations` WHERE id = ?',
      [id]
    );

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = registrations[0];
    const wasVerified = registration.is_verified;
    const isSelfRegistration = registration.is_self_registration;

    // Update registration
    await pool.query(
      `UPDATE \`hw-ca-registrations\`
       SET is_verified = ?,
           verification_notes = ?,
           verified_at = ?,
           verified_by = 'admin'
       WHERE id = ?`,
      [
        is_verified ? 1 : 0,
        verification_notes || null,
        is_verified ? new Date() : null,
        id,
      ]
    );

    // Update CA performance metrics if verification status changed
    if (registration.ca_id && !isSelfRegistration) {
      // Recalculate verified_registrations based on unique teams (not individual participants)
      // Count unique teams from hw-participant-registrations (direct registrations)
      // Using TRIM to handle empty strings and ensuring team_name is not empty
      const [directTeams] = await pool.query(
        `SELECT COUNT(DISTINCT team_name) as team_count
         FROM \`hw-participant-registrations\`
         WHERE ca_id = ? AND is_verified = 1 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
        [registration.ca_id]
      );

      // Count unique teams from hw-ca-registrations (Unstop imports)
      const [unstopTeams] = await pool.query(
        `SELECT COUNT(DISTINCT team_name) as team_count
         FROM \`hw-ca-registrations\`
         WHERE ca_id = ? AND is_verified = 1 AND is_self_registration = 0 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
        [registration.ca_id]
      );

      const directTeamCount = parseInt(directTeams[0]?.team_count || 0, 10);
      const unstopTeamCount = parseInt(unstopTeams[0]?.team_count || 0, 10);
      const totalTeams = directTeamCount + unstopTeamCount;

      console.log(`[CA Score Calc - Verify] CA ID: ${registration.ca_id}, Direct Teams: ${directTeamCount}, Unstop Teams: ${unstopTeamCount}, Total Teams: ${totalTeams}`);

      // Update verified_registrations count (should be number of unique teams)
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET verified_registrations = ?
         WHERE id = ?`,
        [totalTeams, registration.ca_id]
      );

      // Recalculate performance score (10 points per team + task points)
      // Get sum of all points awarded from approved task submissions (includes early bonus)
      const [taskPoints] = await pool.query(
        `SELECT COALESCE(SUM(points_awarded), 0) as total_task_points
         FROM \`hw-ca-task-submissions\`
         WHERE ca_id = ? AND status = 'APPROVED'`,
        [registration.ca_id]
      );

      const totalTaskPoints = parseInt(taskPoints[0]?.total_task_points || 0, 10);
      // Scoring: 10 points per team + actual points from approved tasks (including early bonus)
      const performanceScore = (totalTeams * 10) + totalTaskPoints;
      
      console.log(`[CA Score Calc - Verify] CA ID: ${registration.ca_id}, Total Teams: ${totalTeams}, Task Points: ${totalTaskPoints}, Performance Score: ${performanceScore}`);
      
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET performance_score = ?
         WHERE id = ?`,
        [performanceScore, registration.ca_id]
      );
    }

    // Log verification
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        `CA Registration ${is_verified ? 'Verified' : 'Unverified'}`,
        JSON.stringify({ id, ca_id: registration.ca_id, participant_email: registration.participant_email }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Registration ${is_verified ? 'verified' : 'unverified'} successfully`,
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

