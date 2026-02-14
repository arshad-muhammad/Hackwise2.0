import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

// GET: Fetch all accommodation queries (Admin only)
export async function GET(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [queries] = await pool.query(
      `SELECT 
        id,
        team_name,
        team_lead_name,
        team_lead_email,
        team_lead_phone,
        total_members,
        check_in_date,
        check_out_date,
        special_requirements,
        qr_code_data,
        status,
        created_at,
        updated_at
       FROM \`hw-accommodation-queries\`
       ORDER BY created_at DESC`
    );

    return NextResponse.json(queries);
  } catch (error) {
    console.error('Error fetching accommodation queries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Update accommodation query status (Admin only)
export async function PATCH(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE \`hw-accommodation-queries\`
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );

    // Log the change
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'Accommodation Query Status Updated',
        JSON.stringify({ id, status }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Error updating accommodation query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

