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

    // Get CA details
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

    const ca = cas[0];

    // Get all registrations with full member details
    const [registrations] = await pool.query(
      `SELECT 
        r.id, r.team_name, r.registration_date, r.is_verified, r.ca_code,
        m.first_name, m.last_name, m.email, m.mobile, m.gender, m.location,
        m.institute_name, m.user_type, m.domain, m.course, m.course_specialization,
        m.graduating_year, m.course_duration, m.is_team_lead
       FROM \`hw-participant-registrations\` r
       LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
       WHERE r.ca_id = ?
       ORDER BY r.registration_date DESC, r.id, m.is_team_lead DESC`,
      [caIdInt]
    );

    // Convert to CSV format
    const headers = [
      'Registration ID',
      'Team Name',
      'Registration Date',
      'CA Code',
      'Verified',
      'Member Name',
      'Email',
      'Mobile',
      'Gender',
      'Location',
      'Institute Name',
      'User Type',
      'Domain',
      'Course',
      'Course Specialization',
      'Graduating Year',
      'Course Duration',
      'Is Team Lead',
    ];

    const csvRows = [headers.join(',')];

    for (const row of registrations) {
      const csvRow = [
        row.id || '',
        `"${(row.team_name || '').replace(/"/g, '""')}"`,
        row.registration_date ? new Date(row.registration_date).toISOString() : '',
        row.ca_code || '',
        row.is_verified ? 'Yes' : 'No',
        `"${((row.first_name || '') + ' ' + (row.last_name || '')).trim().replace(/"/g, '""')}"`,
        row.email || '',
        row.mobile || '',
        row.gender || '',
        `"${(row.location || '').replace(/"/g, '""')}"`,
        `"${(row.institute_name || '').replace(/"/g, '""')}"`,
        row.user_type || '',
        row.domain || '',
        row.course || '',
        `"${(row.course_specialization || '').replace(/"/g, '""')}"`,
        row.graduating_year || '',
        row.course_duration || '',
        row.is_team_lead ? 'Yes' : 'No',
      ];
      csvRows.push(csvRow.join(','));
    }

    const csvContent = csvRows.join('\n');
    const filename = `CA_${ca.ca_code}_Registrations_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

