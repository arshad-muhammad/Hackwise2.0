import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, error_description } = body;

    if (!razorpay_order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Find query by order ID
    const [queries] = await pool.query(
      `SELECT id, team_name FROM \`hw-accommodation-queries\` 
       WHERE razorpay_order_id = ?`,
      [razorpay_order_id]
    );

    if (queries.length === 0) {
      return NextResponse.json(
        { error: 'Accommodation query not found' },
        { status: 404 }
      );
    }

    const query = queries[0];

    // Update payment status to failed
    await pool.query(
      `UPDATE \`hw-accommodation-queries\` 
       SET payment_status = 'FAILED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [query.id]
    );

    // Log the failed payment
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'WARN',
        'Accommodation Payment Failed',
        JSON.stringify({ 
          query_id: query.id, 
          team_name: query.team_name,
          order_id: razorpay_order_id,
          error: error_description 
        }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Payment failure recorded',
      queryId: query.id,
    });
  } catch (error) {
    console.error('Error processing payment failure:', error);
    return NextResponse.json(
      { error: 'Failed to process payment failure', details: error.message },
      { status: 500 }
    );
  }
}

