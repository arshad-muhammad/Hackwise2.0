import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyCASession } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('ca_session')?.value;
    const session = await verifyCASession(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ca_id } = session;

    // Get CA details
    const [cas] = await pool.query(
      'SELECT * FROM `hw-ca-applications` WHERE id = ?',
      [ca_id]
    );

    if (cas.length === 0) {
      return NextResponse.json({ error: 'CA not found' }, { status: 404 });
    }

    const ca = cas[0];

    // Get registrations
    const [registrations] = await pool.query(
      `SELECT 
        r.id, r.team_name, r.registration_date, r.is_verified,
        COUNT(m.id) as member_count
       FROM \`hw-participant-registrations\` r
       LEFT JOIN \`hw-participant-members\` m ON r.id = m.registration_id
       WHERE r.ca_id = ?
       GROUP BY r.id
       ORDER BY r.registration_date DESC`,
      [ca_id]
    );

    // Get assigned tasks
    const [tasks] = await pool.query(
      `SELECT 
        t.id, t.title, t.description, t.task_type, t.deadline,
        t.points_on_completion, t.bonus_points_early, t.early_submission_hours,
        ts.id as submission_id, ts.status as submission_status,
        ts.submitted_at, ts.points_awarded, ts.admin_feedback,
        CASE 
          WHEN ts.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END as has_submission,
        CASE
          WHEN NOW() > t.deadline THEN TRUE
          ELSE FALSE
        END as is_overdue
      FROM \`hw-ca-tasks\` t
      INNER JOIN \`hw-ca-task-assignments\` ta ON t.id = ta.task_id
      LEFT JOIN \`hw-ca-task-submissions\` ts ON t.id = ts.task_id AND ts.ca_id = ?
      WHERE ta.ca_id = ? AND t.is_active = TRUE
      ORDER BY t.deadline ASC`,
      [ca_id, ca_id]
    );

    // Get leaderboard (top 20)
    const [leaderboard] = await pool.query(
      `SELECT 
        id, name, ca_code, performance_score, verified_registrations, approved_tasks,
        is_organising_team_candidate
       FROM \`hw-ca-applications\`
       WHERE status = 'APPROVED'
       ORDER BY performance_score DESC, verified_registrations DESC
       LIMIT 20`
    );

    // Find current CA's rank
    const [currentRank] = await pool.query(
      `SELECT COUNT(*) + 1 as rank
       FROM \`hw-ca-applications\`
       WHERE status = 'APPROVED'
       AND (performance_score > ? OR (performance_score = ? AND verified_registrations > ?))`,
      [ca.performance_score, ca.performance_score, ca.verified_registrations]
    );

    return NextResponse.json({
      ca: {
        id: ca.id,
        name: ca.name,
        ca_code: ca.ca_code,
        email: ca.email,
        college: ca.college,
        performance_score: ca.performance_score,
        verified_registrations: ca.verified_registrations,
        approved_tasks: ca.approved_tasks,
        is_organising_team_candidate: ca.is_organising_team_candidate,
        referral_link: ca.referral_link,
      },
      registrations,
      tasks,
      leaderboard,
      current_rank: currentRank[0]?.rank || null,
    });
  } catch (error) {
    console.error('Error fetching CA dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

