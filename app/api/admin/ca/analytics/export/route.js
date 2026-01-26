import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all registrations with full details
    const [registrations] = await pool.query(
      `SELECT 
        r.id as registration_id,
        r.team_name,
        r.registration_date,
        r.is_verified,
        r.ca_code,
        ca.name as ca_name,
        ca.email as ca_email,
        ca.college as ca_college,
        m.first_name,
        m.last_name,
        m.email as member_email,
        m.mobile,
        m.gender,
        m.location,
        m.institute_name,
        m.user_type,
        m.domain,
        m.course,
        m.course_specialization,
        m.graduating_year,
        m.course_duration,
        m.is_team_lead
       FROM \`hw-participant-registrations\` r
       LEFT JOIN \`hw-ca-applications\` ca ON r.ca_id = ca.id
       LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
       WHERE r.ca_id IS NOT NULL
       ORDER BY r.registration_date DESC, r.id, m.is_team_lead DESC`
    );

    // Convert to CSV format
    const headers = [
      'Registration ID',
      'Team Name',
      'Registration Date',
      'CA Code',
      'CA Name',
      'CA Email',
      'CA College',
      'Verified',
      'Member Name',
      'Member Email',
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
        row.registration_id || '',
        `"${(row.team_name || '').replace(/"/g, '""')}"`,
        row.registration_date ? new Date(row.registration_date).toISOString() : '',
        row.ca_code || '',
        `"${(row.ca_name || '').replace(/"/g, '""')}"`,
        row.ca_email || '',
        `"${(row.ca_college || '').replace(/"/g, '""')}"`,
        row.is_verified ? 'Yes' : 'No',
        `"${((row.first_name || '') + ' ' + (row.last_name || '')).trim().replace(/"/g, '""')}"`,
        row.member_email || '',
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
    const filename = `All_CA_Registrations_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting all CA registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

