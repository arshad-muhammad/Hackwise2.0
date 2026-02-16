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
        payment_status,
        amount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        invoice_url,
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

// DELETE: Delete accommodation query (Admin only)
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
        { error: 'id is required' },
        { status: 400 }
      );
    }

    // Check if query exists
    const [queries] = await pool.query(
      `SELECT id, team_name FROM \`hw-accommodation-queries\` WHERE id = ?`,
      [id]
    );

    if (queries.length === 0) {
      return NextResponse.json(
        { error: 'Accommodation query not found' },
        { status: 404 }
      );
    }

    // Delete the query
    await pool.query(
      `DELETE FROM \`hw-accommodation-queries\` WHERE id = ?`,
      [id]
    );

    // Log the deletion
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'WARNING',
        'Accommodation Query Deleted',
        JSON.stringify({ id, team_name: queries[0].team_name }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Accommodation query deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting accommodation query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

