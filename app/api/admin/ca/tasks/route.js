import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Fetch all tasks
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');

    let query = `
      SELECT 
        t.id, t.title, t.description, t.task_type, t.deadline,
        t.points_on_completion, t.bonus_points_early, t.early_submission_hours,
        t.is_active, t.created_by, t.created_at, t.updated_at,
        COUNT(DISTINCT ta.ca_id) as assigned_count,
        COUNT(DISTINCT ts.id) as submission_count
      FROM \`hw-ca-tasks\` t
      LEFT JOIN \`hw-ca-task-assignments\` ta ON t.id = ta.task_id
      LEFT JOIN \`hw-ca-task-submissions\` ts ON t.id = ts.task_id
    `;

    const params = [];
    if (is_active !== null && is_active !== '') {
      query += ' WHERE t.is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    } else {
      query += ' WHERE 1=1';
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const [tasks] = await pool.query(query, params);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new task
export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      task_type,
      deadline,
      points_on_completion,
      bonus_points_early,
      early_submission_hours,
      assign_to_all,
      assigned_ca_ids,
    } = body;

    // Validation
    if (!title || !description || !task_type || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['TEXT', 'FILE', 'SCREENSHOT', 'MIXED'].includes(task_type)) {
      return NextResponse.json(
        { error: 'Invalid task type' },
        { status: 400 }
      );
    }

    // Create task
    const [result] = await pool.query(
      `INSERT INTO \`hw-ca-tasks\`
       (title, description, task_type, deadline, points_on_completion, 
        bonus_points_early, early_submission_hours, is_active, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, 'admin')`,
      [
        title,
        description,
        task_type,
        new Date(deadline),
        points_on_completion || 5,
        bonus_points_early || 2,
        early_submission_hours || 24,
      ]
    );

    const taskId = result.insertId;

    // Assign task to CAs
    if (assign_to_all) {
      // Get all approved CAs
      const [approvedCAs] = await pool.query(
        'SELECT id FROM `hw-ca-applications` WHERE status = "APPROVED"'
      );

      // Assign to all
      if (approvedCAs.length > 0) {
        const assignments = approvedCAs.map((ca) => [taskId, ca.id]);
        await pool.query(
          `INSERT INTO \`hw-ca-task-assignments\` (task_id, ca_id)
           VALUES ?`,
          [assignments]
        );
      }
    } else if (assigned_ca_ids && Array.isArray(assigned_ca_ids) && assigned_ca_ids.length > 0) {
      // Assign to selected CAs
      const assignments = assigned_ca_ids.map((caId) => [taskId, caId]);
      await pool.query(
        `INSERT INTO \`hw-ca-task-assignments\` (task_id, ca_id)
         VALUES ?`,
        [assignments]
      );
    }

    // Log task creation
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'CA Task Created',
        JSON.stringify({ id: taskId, title, task_type }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      id: taskId,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update a task
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      task_type,
      deadline,
      points_on_completion,
      bonus_points_early,
      early_submission_hours,
      is_active,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (task_type !== undefined) {
      updates.push('task_type = ?');
      params.push(task_type);
    }
    if (deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(new Date(deadline));
    }
    if (points_on_completion !== undefined) {
      updates.push('points_on_completion = ?');
      params.push(points_on_completion);
    }
    if (bonus_points_early !== undefined) {
      updates.push('bonus_points_early = ?');
      params.push(bonus_points_early);
    }
    if (early_submission_hours !== undefined) {
      updates.push('early_submission_hours = ?');
      params.push(early_submission_hours);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    params.push(id);

    await pool.query(
      `UPDATE \`hw-ca-tasks\` SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a task (soft delete by setting is_active = false)
export async function DELETE(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Soft delete: set is_active = false
    await pool.query(
      'UPDATE `hw-ca-tasks` SET is_active = FALSE WHERE id = ?',
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Task deactivated successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

