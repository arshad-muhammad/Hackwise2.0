import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params as Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { ca_id } = resolvedParams || {};

    if (!ca_id) {
      return NextResponse.json({ error: 'CA ID is required' }, { status: 400 });
    }

    const caIdInt = parseInt(ca_id, 10);
    if (isNaN(caIdInt) || caIdInt <= 0) {
      return NextResponse.json({ error: 'Invalid CA ID' }, { status: 400 });
    }
    const body = await request.json();
    const { points, reason } = body;

    // Validate inputs
    if (typeof points !== 'number' || isNaN(points)) {
      return NextResponse.json({ error: 'Invalid points value' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Get current CA data
    const [ca] = await pool.query(
      'SELECT id, performance_score, name, ca_code FROM `hw-ca-applications` WHERE id = ?',
      [caIdInt]
    );

    if (ca.length === 0) {
      return NextResponse.json({ error: 'CA not found' }, { status: 404 });
    }

    const currentScore = parseInt(ca[0].performance_score || 0, 10);
    const newScore = Math.max(0, currentScore + points); // Ensure score doesn't go below 0

    // Update performance score
    await pool.query(
      'UPDATE `hw-ca-applications` SET performance_score = ? WHERE id = ?',
      [newScore, caIdInt]
    );

    // Get admin info from session
    const sessionData = await verifySession(token);
    const adminEmail = sessionData?.email || sessionData?.name || 'Unknown';

    // Log the manual adjustment
    await pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'CA Points Manually Adjusted',
        JSON.stringify({
          ca_id: caIdInt,
          ca_name: ca[0].name,
          ca_code: ca[0].ca_code,
          previous_score: currentScore,
          points_adjusted: points,
          new_score: newScore,
          reason: reason.trim(),
          adjusted_by: adminEmail,
        }),
      ]
    );

    console.log(`[CA Points Adjustment] CA ID: ${caIdInt}, Previous: ${currentScore}, Adjustment: ${points}, New: ${newScore}, Reason: ${reason}`);

    return NextResponse.json({
      success: true,
      previous_score: currentScore,
      points_adjusted: points,
      new_score: newScore,
    });
  } catch (error) {
    console.error('Error adjusting CA points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

