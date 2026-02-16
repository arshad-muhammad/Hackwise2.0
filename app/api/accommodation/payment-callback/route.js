import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Find query by order ID
    const [queries] = await pool.query(
      `SELECT id, team_name, team_lead_email, payment_status FROM \`hw-accommodation-queries\` 
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

    // Check if already processed
    if (query.payment_status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        queryId: query.id,
      });
    }

    // Update payment status
    await pool.query(
      `UPDATE \`hw-accommodation-queries\` 
       SET razorpay_payment_id = ?,
           razorpay_signature = ?,
           payment_status = 'SUCCESS',
           status = 'CONFIRMED',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, query.id]
    );

    // Log the payment
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'Accommodation Payment Successful',
        JSON.stringify({ 
          query_id: query.id, 
          team_name: query.team_name,
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id 
        }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      queryId: query.id,
    });
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', details: error.message },
      { status: 500 }
    );
  }
}

