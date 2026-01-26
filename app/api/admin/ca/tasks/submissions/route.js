import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Fetch all submissions for a task
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const [submissions] = await pool.query(
      `SELECT 
        ts.id,
        ts.task_id,
        ts.ca_id,
        ts.submission_text,
        ts.file_url,
        ts.screenshot_url,
        ts.status,
        ts.points_awarded,
        ts.admin_feedback,
        ts.submitted_at,
        ts.reviewed_at,
        ts.reviewed_by,
        ca.name as ca_name,
        ca.email as ca_email,
        ca.ca_code,
        ca.college,
        t.title as task_title,
        t.task_type,
        t.points_on_completion,
        t.bonus_points_early,
        t.deadline as task_deadline
      FROM \`hw-ca-task-submissions\` ts
      JOIN \`hw-ca-applications\` ca ON ts.ca_id = ca.id
      JOIN \`hw-ca-tasks\` t ON ts.task_id = t.id
      WHERE ts.task_id = ?
      ORDER BY ts.submitted_at DESC`,
      [task_id]
    );

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Review a submission (approve/reject)
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submission_id, status, admin_feedback, points_awarded } = body;

    if (!submission_id || !status) {
      return NextResponse.json(
        { error: 'Submission ID and status are required' },
        { status: 400 }
      );
    }

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Get submission details
    const [submissions] = await pool.query(
      `SELECT ts.*, t.points_on_completion, t.bonus_points_early, t.early_submission_hours, t.deadline
       FROM \`hw-ca-task-submissions\` ts
       JOIN \`hw-ca-tasks\` t ON ts.task_id = t.id
       WHERE ts.id = ?`,
      [submission_id]
    );

    if (submissions.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const submission = submissions[0];

    // Calculate points if not provided
    let finalPoints = points_awarded;
    if (!finalPoints && status === 'APPROVED') {
      finalPoints = submission.points_on_completion || 5;
      
      // Check for early submission bonus
      if (submission.bonus_points_early > 0 && submission.early_submission_hours) {
        const submittedAt = new Date(submission.submitted_at);
        const deadline = new Date(submission.deadline);
        const hoursBeforeDeadline = (deadline - submittedAt) / (1000 * 60 * 60);
        
        if (hoursBeforeDeadline >= submission.early_submission_hours) {
          finalPoints += submission.bonus_points_early;
        }
      }
    } else if (status === 'REJECTED') {
      finalPoints = 0;
    }

    // Update submission
    await pool.query(
      `UPDATE \`hw-ca-task-submissions\`
       SET status = ?,
           points_awarded = ?,
           admin_feedback = ?,
           reviewed_at = NOW(),
           reviewed_by = 'admin'
       WHERE id = ?`,
      [status, finalPoints || 0, admin_feedback || null, submission_id]
    );

    // Update CA performance if approved
    if (status === 'APPROVED') {
      // Increment approved_tasks count
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET approved_tasks = approved_tasks + 1
         WHERE id = ?`,
        [submission.ca_id]
      );

      // Recalculate verified_registrations based on unique teams (not individual participants)
      // Count unique teams from hw-participant-registrations (direct registrations)
      // Using TRIM to handle empty strings and ensuring team_name is not empty
      const [directTeams] = await pool.query(
        `SELECT COUNT(DISTINCT team_name) as team_count
         FROM \`hw-participant-registrations\`
         WHERE ca_id = ? AND is_verified = 1 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
        [submission.ca_id]
      );

      // Count unique teams from hw-ca-registrations (Unstop imports)
      const [unstopTeams] = await pool.query(
        `SELECT COUNT(DISTINCT team_name) as team_count
         FROM \`hw-ca-registrations\`
         WHERE ca_id = ? AND is_verified = 1 AND is_self_registration = 0 AND team_name IS NOT NULL AND TRIM(team_name) != ''`,
        [submission.ca_id]
      );

      const directTeamCount = parseInt(directTeams[0]?.team_count || 0, 10);
      const unstopTeamCount = parseInt(unstopTeams[0]?.team_count || 0, 10);
      const totalTeams = directTeamCount + unstopTeamCount;

      console.log(`[CA Score Calc - Task] CA ID: ${submission.ca_id}, Direct Teams: ${directTeamCount}, Unstop Teams: ${unstopTeamCount}, Total Teams: ${totalTeams}`);

      // Update verified_registrations count (should be number of unique teams)
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET verified_registrations = ?
         WHERE id = ?`,
        [totalTeams, submission.ca_id]
      );

      // Recalculate performance score (10 points per team + task points)
      // Get sum of all points awarded from approved task submissions (includes early bonus)
      const [taskPoints] = await pool.query(
        `SELECT COALESCE(SUM(points_awarded), 0) as total_task_points
         FROM \`hw-ca-task-submissions\`
         WHERE ca_id = ? AND status = 'APPROVED'`,
        [submission.ca_id]
      );

      const totalTaskPoints = parseInt(taskPoints[0]?.total_task_points || 0, 10);
      // Scoring: 10 points per team + actual points from approved tasks (including early bonus)
      const performanceScore = (totalTeams * 10) + totalTaskPoints;
      
      console.log(`[CA Score Calc - Task] CA ID: ${submission.ca_id}, Total Teams: ${totalTeams}, Task Points: ${totalTaskPoints}, Performance Score: ${performanceScore}`);
      
      await pool.query(
        `UPDATE \`hw-ca-applications\`
         SET performance_score = ?
         WHERE id = ?`,
        [performanceScore, submission.ca_id]
      );
    }

    // Log the review
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'Task Submission Reviewed',
        JSON.stringify({ 
          submission_id, 
          status, 
          points_awarded: finalPoints,
          ca_id: submission.ca_id 
        }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: `Submission ${status.toLowerCase()} successfully`,
      points_awarded: finalPoints,
    });
  } catch (error) {
    console.error('Error reviewing submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

