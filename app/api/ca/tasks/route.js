import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyCASession } from '@/lib/auth';

// GET: Fetch assigned tasks for logged-in CA
export async function GET(request) {
  try {
    const token = request.cookies.get('ca_session')?.value;
    const session = await verifyCASession(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ca_id } = session;

    // Fetch tasks assigned to this CA
    const [tasks] = await pool.query(
      `SELECT 
        t.id, t.title, t.description, t.task_type, t.deadline,
        t.points_on_completion, t.bonus_points_early, t.early_submission_hours,
        t.is_active, t.created_at,
        ta.assigned_at,
        ts.id as submission_id, ts.status as submission_status,
        ts.submitted_at, ts.points_awarded, ts.admin_feedback,
        CASE 
          WHEN ts.id IS NOT NULL THEN TRUE
          ELSE FALSE
        END as has_submission,
        CASE
          WHEN NOW() > t.deadline THEN TRUE
          ELSE FALSE
        END as is_overdue,
        CASE
          WHEN ts.submitted_at IS NOT NULL AND ts.submitted_at < DATE_SUB(t.deadline, INTERVAL t.early_submission_hours HOUR) THEN TRUE
          ELSE FALSE
        END as is_early_submission
      FROM \`hw-ca-tasks\` t
      INNER JOIN \`hw-ca-task-assignments\` ta ON t.id = ta.task_id
      LEFT JOIN \`hw-ca-task-submissions\` ts ON t.id = ts.task_id AND ts.ca_id = ?
      WHERE ta.ca_id = ? AND t.is_active = TRUE
      ORDER BY t.deadline ASC`,
      [ca_id, ca_id]
    );

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching CA tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

