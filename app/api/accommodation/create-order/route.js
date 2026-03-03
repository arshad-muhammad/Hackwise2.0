import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import pool from '@/lib/db';

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (
    !keyId || keyId === 'your_razorpay_key_id' ||
    !keySecret || keySecret === 'your_razorpay_key_secret'
  ) {
    throw new Error('Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables.');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { queryId, amount } = body;

    if (!queryId || !amount) {
      return NextResponse.json(
        { error: 'queryId and amount are required' },
        { status: 400 }
      );
    }

    // Verify query exists
    const [queries] = await pool.query(
      `SELECT id, team_name, payment_status FROM \`hw-accommodation-queries\` WHERE id = ?`,
      [queryId]
    );

    if (queries.length === 0) {
      return NextResponse.json(
        { error: 'Accommodation query not found' },
        { status: 404 }
      );
    }

    const query = queries[0];

    // Check if already paid
    if (query.payment_status === 'SUCCESS') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    // Get Razorpay instance (validates keys)
    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (keyError) {
      console.error('Razorpay configuration error:', keyError.message);
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `acc_${queryId}_${Date.now()}`,
      notes: {
        query_id: queryId.toString(),
        team_name: query.team_name,
        type: 'accommodation',
      },
    };

    const order = await razorpay.orders.create(options);

    // Update query with order ID
    await pool.query(
      `UPDATE \`hw-accommodation-queries\` 
       SET razorpay_order_id = ?, amount = ?
       WHERE id = ?`,
      [order.id, amount, queryId]
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount / 100, // Convert back to rupees
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order', details: error.message },
      { status: 500 }
    );
  }
}
