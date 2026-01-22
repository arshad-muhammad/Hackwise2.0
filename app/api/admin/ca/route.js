import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// Helper function to generate unique CA code
async function generateCACode(collegeAbbreviation) {
  if (!collegeAbbreviation) {
    // Fallback: use generic code
    collegeAbbreviation = 'CA';
  }

  // Clean and uppercase abbreviation
  const abbrev = collegeAbbreviation.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  
  // Find the highest number for this abbreviation
  const [existing] = await pool.query(
    `SELECT ca_code FROM \`hw-ca-applications\` 
     WHERE ca_code LIKE ? AND ca_code REGEXP '^[A-Z]+[0-9]+$'
     ORDER BY CAST(SUBSTRING(ca_code, LENGTH(?) + 1) AS UNSIGNED) DESC
     LIMIT 1`,
    [`${abbrev}%`, abbrev]
  );

  let nextNumber = 1;
  if (existing.length > 0) {
    const lastCode = existing[0].ca_code;
    const match = lastCode.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[2], 10) + 1;
    }
  }

  // Format: ABBREV001, ABBREV002, etc.
  const caCode = `${abbrev}${String(nextNumber).padStart(3, '0')}`;

  // Double-check uniqueness (safety check)
  const [duplicate] = await pool.query(
    'SELECT id FROM `hw-ca-applications` WHERE ca_code = ?',
    [caCode]
  );

  if (duplicate.length > 0) {
    // If somehow duplicate, increment
    return generateCACode(collegeAbbreviation + 'X');
  }

  return caCode;
}

// GET: Fetch all CA applications with optional filtering
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, APPROVED, REJECTED
    const search = searchParams.get('search'); // Search by name, email, college, ca_code

    let query = `
      SELECT 
        id, name, email, phone, college, college_abbreviation, branch, year,
        why_interested, previous_experience, social_media_links,
        status, ca_code, referral_link,
        performance_score, verified_registrations, approved_tasks,
        is_organising_team_candidate, admin_notes,
        approved_at, approved_by,
        created_at, updated_at
      FROM \`hw-ca-applications\`
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ` AND (
        name LIKE ? OR 
        email LIKE ? OR 
        college LIKE ? OR 
        ca_code LIKE ?
      )`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY created_at DESC';

    const [applications] = await pool.query(query, params);

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching CA applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Approve a CA application
export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action, admin_notes } = body; // action: 'approve' or 'reject'

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current application
    const [applications] = await pool.query(
      'SELECT * FROM `hw-ca-applications` WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const application = applications[0];

    if (action === 'approve') {
      // Check if already approved
      if (application.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Application already approved' },
          { status: 400 }
        );
      }

      // Generate CA code if not exists
      let caCode = application.ca_code;
      if (!caCode) {
        caCode = await generateCACode(application.college_abbreviation);
      }

      // Generate referral link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hackwise.spherehive.in';
      const referralLink = `${baseUrl}/r/${caCode}`;

      // Update application
      const [updateResult] = await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET status = 'APPROVED',
             ca_code = ?,
             referral_link = ?,
             admin_notes = ?,
             approved_at = NOW(),
             approved_by = 'admin'
         WHERE id = ?`,
        [caCode, referralLink, admin_notes || null, id]
      );

      // Verify the update
      const [verify] = await pool.query(
        'SELECT status, ca_code FROM `hw-ca-applications` WHERE id = ?',
        [id]
      );
      
      console.log(`CA Approval: ID ${id}, Status: ${verify[0]?.status}, CA Code: ${verify[0]?.ca_code}`);
      
      if (verify[0]?.status !== 'APPROVED') {
        console.error(`WARNING: Status update may have failed. Expected APPROVED, got ${verify[0]?.status}`);
      }

      // Log the approval
      pool.query(
        'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
        [
          'INFO',
          'CA Application Approved',
          JSON.stringify({ id, ca_code: caCode, email: application.email }),
        ]
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        ca_code: caCode,
        referral_link: referralLink,
        message: 'Application approved successfully',
      });
    } else if (action === 'reject') {
      // Update application to rejected
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET status = 'REJECTED',
             admin_notes = ?
         WHERE id = ?`,
        [admin_notes || null, id]
      );

      // Log the rejection
      pool.query(
        'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
        [
          'INFO',
          'CA Application Rejected',
          JSON.stringify({ id, email: application.email }),
        ]
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing CA application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

