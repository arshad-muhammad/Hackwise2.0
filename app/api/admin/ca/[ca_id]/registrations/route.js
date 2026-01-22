import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params as Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { ca_id } = resolvedParams || {};

    if (!ca_id) {
      return NextResponse.json(
        { error: 'CA ID is required' },
        { status: 400 }
      );
    }

    const caIdInt = parseInt(ca_id, 10);

    if (isNaN(caIdInt) || caIdInt <= 0) {
      return NextResponse.json(
        { error: 'Invalid CA ID' },
        { status: 400 }
      );
    }

    // Get CA details first
    const [cas] = await pool.query(
      'SELECT id, name, ca_code, email, college FROM `hw-ca-applications` WHERE id = ?',
      [caIdInt]
    );

    if (cas.length === 0) {
      return NextResponse.json(
        { error: 'CA not found' },
        { status: 404 }
      );
    }

    // Get registrations for this CA
    let registrations = [];
    try {
      const [regResults] = await pool.query(
        `SELECT 
          r.id, r.team_name, r.registration_date, r.is_verified,
          COUNT(m.id) as member_count,
          GROUP_CONCAT(CONCAT(m.first_name, ' ', COALESCE(m.last_name, '')) SEPARATOR ', ') as member_names
         FROM \`hw-participant-registrations\` r
         LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
         WHERE r.ca_id = ?
         GROUP BY r.id
         ORDER BY r.registration_date DESC`,
        [caIdInt]
      );
      registrations = regResults;
    } catch (error) {
      // If table doesn't exist, return empty array
      console.error('Error fetching registrations (table may not exist):', error);
      registrations = [];
    }

    return NextResponse.json({
      ca: cas[0],
      registrations,
      total: registrations.length,
    });
  } catch (error) {
    console.error('Error fetching CA registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

