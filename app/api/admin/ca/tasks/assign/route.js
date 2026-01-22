import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// POST: Assign task to CAs
export async function POST(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { task_id, ca_ids, assign_to_all } = body;

    if (!task_id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Verify task exists
    const [tasks] = await pool.query(
      'SELECT id FROM `hw-ca-tasks` WHERE id = ?',
      [task_id]
    );

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    let caIdsToAssign = [];

    if (assign_to_all) {
      // Get all approved CAs
      const [approvedCAs] = await pool.query(
        'SELECT id FROM `hw-ca-applications` WHERE status = "APPROVED"'
      );
      caIdsToAssign = approvedCAs.map((ca) => ca.id);
    } else if (ca_ids && Array.isArray(ca_ids) && ca_ids.length > 0) {
      caIdsToAssign = ca_ids;
    } else {
      return NextResponse.json(
        { error: 'Must specify either assign_to_all or ca_ids' },
        { status: 400 }
      );
    }

    // Remove existing assignments for this task (optional - comment out if you want to keep existing)
    // await pool.query('DELETE FROM `hw-ca-task-assignments` WHERE task_id = ?', [task_id]);

    // Insert new assignments (ignore duplicates)
    const assignments = caIdsToAssign.map((caId) => [task_id, caId]);
    
    if (assignments.length > 0) {
      await pool.query(
        `INSERT IGNORE INTO \`hw-ca-task-assignments\` (task_id, ca_id)
         VALUES ?`,
        [assignments]
      );
    }

    return NextResponse.json({
      success: true,
      assigned_count: assignments.length,
      message: `Task assigned to ${assignments.length} CA(s)`,
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Unassign task from CAs
export async function DELETE(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');
    const ca_id = searchParams.get('ca_id');

    if (!task_id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    let query = 'DELETE FROM `hw-ca-task-assignments` WHERE task_id = ?';
    const params = [task_id];

    if (ca_id) {
      query += ' AND ca_id = ?';
      params.push(ca_id);
    }

    await pool.query(query, params);

    return NextResponse.json({
      success: true,
      message: 'Assignment(s) removed successfully',
    });
  } catch (error) {
    console.error('Error removing assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

