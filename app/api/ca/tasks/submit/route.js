import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyCASession } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.cookies.get('ca_session')?.value;
    const session = await verifyCASession(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ca_id } = session;
    const body = await request.json();
    const { task_id, submission_text, file_url, screenshot_url } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Verify task is assigned to this CA
    const [assignments] = await pool.query(
      'SELECT * FROM `hw-ca-task-assignments` WHERE task_id = ? AND ca_id = ?',
      [task_id, ca_id]
    );

    if (assignments.length === 0) {
      return NextResponse.json(
        { error: 'Task not assigned to you' },
        { status: 403 }
      );
    }

    // Get task details
    const [tasks] = await pool.query(
      'SELECT * FROM `hw-ca-tasks` WHERE id = ? AND is_active = TRUE',
      [task_id]
    );

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'Task not found or inactive' },
        { status: 404 }
      );
    }

    const task = tasks[0];

    // Check if deadline has passed
    if (new Date() > new Date(task.deadline)) {
      return NextResponse.json(
        { error: 'Submission deadline has passed' },
        { status: 400 }
      );
    }

    // Check if already submitted
    const [existing] = await pool.query(
      'SELECT id FROM `hw-ca-task-submissions` WHERE task_id = ? AND ca_id = ?',
      [task_id, ca_id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'You have already submitted this task' },
        { status: 400 }
      );
    }

    // Validate submission based on task type
    if (task.task_type === 'TEXT' && !submission_text) {
      return NextResponse.json(
        { error: 'Text submission is required for this task' },
        { status: 400 }
      );
    }

    if (task.task_type === 'FILE' && !file_url) {
      return NextResponse.json(
        { error: 'File upload is required for this task' },
        { status: 400 }
      );
    }

    if (task.task_type === 'SCREENSHOT' && !screenshot_url) {
      return NextResponse.json(
        { error: 'Screenshot upload is required for this task' },
        { status: 400 }
      );
    }

    if (task.task_type === 'MIXED' && !submission_text && !file_url && !screenshot_url) {
      return NextResponse.json(
        { error: 'At least one submission field is required' },
        { status: 400 }
      );
    }

    // Check if early submission
    const now = new Date();
    const deadline = new Date(task.deadline);
    const earlyDeadline = new Date(deadline.getTime() - task.early_submission_hours * 60 * 60 * 1000);
    const isEarlySubmission = now < earlyDeadline;

    // Insert submission
    await pool.query(
      `INSERT INTO \`hw-ca-task-submissions\`
       (task_id, ca_id, submission_text, file_url, screenshot_url, 
        submitted_at, is_early_submission, status)
       VALUES (?, ?, ?, ?, ?, NOW(), ?, 'PENDING')`,
      [
        task_id,
        ca_id,
        submission_text || null,
        file_url || null,
        screenshot_url || null,
        isEarlySubmission ? 1 : 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Task submitted successfully',
      is_early_submission: isEarlySubmission,
    });
  } catch (error) {
    console.error('Error submitting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

