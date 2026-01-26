import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get CA Leaderboard
    const [leaderboard] = await pool.query(
      `SELECT 
        id, name, ca_code, email, college,
        performance_score, verified_registrations, approved_tasks,
        is_organising_team_candidate,
        created_at, approved_at
       FROM \`hw-ca-applications\`
       WHERE status = 'APPROVED'
       ORDER BY performance_score DESC, verified_registrations DESC, approved_tasks DESC`
    );

    // Get total registrations per CA
    const [registrationsByCA] = await pool.query(
      `SELECT 
        r.ca_id,
        ca.name as ca_name,
        ca.ca_code,
        COUNT(DISTINCT r.id) as total_registrations,
        COUNT(DISTINCT m.id) as total_members,
        MIN(r.registration_date) as first_registration,
        MAX(r.registration_date) as last_registration
       FROM \`hw-participant-registrations\` r
       LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
       LEFT JOIN \`hw-ca-applications\` ca ON r.ca_id = ca.id
       WHERE r.ca_id IS NOT NULL
       GROUP BY r.ca_id, ca.name, ca.ca_code
       ORDER BY total_registrations DESC`
    );

    // Get overall statistics
    const [totalStats] = await pool.query(
      `SELECT 
        COUNT(DISTINCT r.id) as total_registrations,
        COUNT(DISTINCT m.id) as total_participants,
        COUNT(DISTINCT r.ca_id) as total_active_cas,
        SUM(CASE WHEN r.is_verified = 1 THEN 1 ELSE 0 END) as verified_registrations
       FROM \`hw-participant-registrations\` r
       LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
       WHERE r.ca_id IS NOT NULL`
    );

    // Get registrations over time (last 30 days)
    const [registrationsOverTime] = await pool.query(
      `SELECT 
        DATE(r.registration_date) as date,
        COUNT(DISTINCT r.id) as count
       FROM \`hw-participant-registrations\` r
       WHERE r.ca_id IS NOT NULL
         AND r.registration_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(r.registration_date)
       ORDER BY date ASC`
    );

    // Get top performing CAs (top 10)
    const topPerformers = leaderboard.slice(0, 10);

    return NextResponse.json({
      leaderboard,
      registrationsByCA,
      totalStats: totalStats[0] || {
        total_registrations: 0,
        total_participants: 0,
        total_active_cas: 0,
        verified_registrations: 0,
      },
      registrationsOverTime,
      topPerformers,
    });
  } catch (error) {
    console.error('Error fetching CA analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

