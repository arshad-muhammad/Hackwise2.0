import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { sendTaskAssignmentEmail } from '@/lib/email';

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

    // Verify task exists and get task details
    const [tasks] = await pool.query(
      'SELECT id, title, description, deadline, task_type, points_on_completion, bonus_points_early FROM `hw-ca-tasks` WHERE id = ?',
      [task_id]
    );

    if (tasks.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const task = tasks[0];
    const taskDetails = {
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      task_type: task.task_type,
      points_on_completion: task.points_on_completion || 5,
      bonus_points_early: task.bonus_points_early || 0,
    };

    let caIdsToAssign = [];
    let caDetailsToEmail = [];

    if (assign_to_all) {
      // Get all approved CAs with their details
      const [approvedCAs] = await pool.query(
        'SELECT id, name, email FROM `hw-ca-applications` WHERE status = "APPROVED"'
      );
      caIdsToAssign = approvedCAs.map((ca) => ca.id);
      caDetailsToEmail = approvedCAs;
    } else if (ca_ids && Array.isArray(ca_ids) && ca_ids.length > 0) {
      // Get selected CAs with their details
      const placeholders = ca_ids.map(() => '?').join(',');
      const [selectedCAs] = await pool.query(
        `SELECT id, name, email FROM \`hw-ca-applications\` WHERE id IN (${placeholders}) AND status = "APPROVED"`,
        ca_ids
      );
      caIdsToAssign = selectedCAs.map((ca) => ca.id);
      caDetailsToEmail = selectedCAs;
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

    // Send emails to assigned CAs (async, don't block response)
    if (caDetailsToEmail.length > 0) {
      console.log('[TASK ASSIGNMENT] Sending task assignment emails...', {
        task_id: task_id,
        task_title: task.title,
        recipients_count: caDetailsToEmail.length,
        recipients: caDetailsToEmail.map(ca => ({ id: ca.id, email: ca.email, name: ca.name }))
      });
      
      Promise.all(
        caDetailsToEmail.map((ca) =>
          sendTaskAssignmentEmail(ca.email, ca.name, { ...taskDetails, id: task_id }).catch((error) => {
            console.error(`[TASK ASSIGNMENT] ❌ Failed to send email to ${ca.email}:`, error);
            console.error(`[TASK ASSIGNMENT] Error details:`, {
              ca_id: ca.id,
              email: ca.email,
              task_id: task_id,
              error: error.message
            });
            // Log email failures
            pool.query(
              'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
              [
                'WARN',
                'Task Assignment Email Failed',
                JSON.stringify({ ca_id: ca.id, email: ca.email, task_id: task_id, error: error.message }),
              ]
            ).catch(console.error);
          })
        )
      ).then((results) => {
        const successCount = results.filter(r => r?.success).length;
        const failCount = results.length - successCount;
        console.log(`[TASK ASSIGNMENT] Email sending completed: ${successCount} succeeded, ${failCount} failed`);
      }).catch(console.error);
    } else {
      console.log('[TASK ASSIGNMENT] No CAs to email');
    }

    return NextResponse.json({
      success: true,
      assigned_count: assignments.length,
      message: `Task assigned to ${assignments.length} CA(s)`,
      emails_sent: caDetailsToEmail.length,
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

