import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Ensure accommodation table exists on first use
let tableChecked = false;

async function ensureTableExists() {
  if (tableChecked) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`hw-accommodation-queries\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        team_name VARCHAR(255) NOT NULL,
        team_lead_name VARCHAR(255) NOT NULL,
        team_lead_email VARCHAR(255) NOT NULL,
        team_lead_phone VARCHAR(50) NOT NULL,
        total_members INT NOT NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        special_requirements TEXT,
        qr_code_data TEXT,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
        amount DECIMAL(10, 2),
        invoice_url VARCHAR(500),
        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_team_name (team_name),
        INDEX idx_status (status),
        INDEX idx_payment_status (payment_status),
        INDEX idx_razorpay_order_id (razorpay_order_id),
        INDEX idx_created_at (created_at)
      )
    `);
    tableChecked = true;
  } catch (err) {
    // If table already exists this is fine, mark as checked
    tableChecked = true;
  }
}

export async function POST(request) {
  try {
    // Ensure the accommodation table exists
    await ensureTableExists();

    const body = await request.json();
    const {
      team_name,
      team_lead_name,
      team_lead_email,
      team_lead_phone,
      total_members,
      check_in_date,
      check_out_date,
      special_requirements,
    } = body;

    // Validation
    if (!team_name || !team_lead_name || !team_lead_email || !team_lead_phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!total_members || total_members < 1) {
      return NextResponse.json(
        { error: 'Total members must be at least 1' },
        { status: 400 }
      );
    }

    if (!check_in_date || !check_out_date) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    // Check if accommodation is enabled
    const [settings] = await pool.query(
      `SELECT setting_value FROM \`hw-settings\` WHERE setting_key = 'accommodation_enabled'`
    );
    
    const isEnabled = settings.length > 0 && 
      (settings[0].setting_value === '1' || settings[0].setting_value === 'true');
    
    if (!isEnabled) {
      return NextResponse.json(
        { error: 'Accommodation portal is currently closed' },
        { status: 403 }
      );
    }

    // Check for an existing booking from the same email (any payment status)
    const [existing] = await pool.query(
      `SELECT id, payment_status, amount, check_in_date, check_out_date
       FROM \`hw-accommodation-queries\`
       WHERE team_lead_email = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [team_lead_email]
    );

    if (existing.length > 0) {
      const existingRecord = existing[0];

      // If already paid, block a new booking
      if (existingRecord.payment_status === 'SUCCESS') {
        return NextResponse.json(
          { error: 'You already have a confirmed accommodation booking. Please contact support if you need to make changes.' },
          { status: 409 }
        );
      }

      // If PENDING or FAILED, reuse the existing record so the user can retry payment
      // Update it with the latest submitted details and reset to PENDING
      await pool.query(
        `UPDATE \`hw-accommodation-queries\`
         SET team_name = ?, team_lead_name = ?, team_lead_phone = ?,
             total_members = ?, check_in_date = ?, check_out_date = ?,
             special_requirements = ?, payment_status = 'PENDING',
             razorpay_order_id = NULL, razorpay_payment_id = NULL,
             razorpay_signature = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          team_name,
          team_lead_name,
          team_lead_phone,
          total_members,
          check_in_date,
          check_out_date,
          special_requirements || null,
          existingRecord.id,
        ]
      );

      // Recalculate price for the updated booking
      const [priceSettingsRetry] = await pool.query(
        `SELECT setting_key, setting_value FROM \`hw-settings\`
         WHERE setting_key IN ('accommodation_price', 'accommodation_pricing_type')`
      );
      const settingsMapRetry = {};
      priceSettingsRetry.forEach(row => { settingsMapRetry[row.setting_key] = row.setting_value; });

      const basePriceRetry = settingsMapRetry.accommodation_price ? parseFloat(settingsMapRetry.accommodation_price) : 0;
      const pricingTypeRetry = settingsMapRetry.accommodation_pricing_type || 'per_team';

      const checkInRetry = new Date(check_in_date);
      const checkOutRetry = new Date(check_out_date);
      const nightsRetry = Math.ceil(Math.abs(checkOutRetry - checkInRetry) / (1000 * 60 * 60 * 24));
      const priceForNightsRetry = basePriceRetry * nightsRetry;
      const finalPriceRetry = pricingTypeRetry === 'per_person'
        ? priceForNightsRetry * total_members
        : priceForNightsRetry;

      await pool.query(
        `UPDATE \`hw-accommodation-queries\` SET amount = ? WHERE id = ?`,
        [finalPriceRetry, existingRecord.id]
      );

      pool.query(
        'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
        ['INFO', 'Accommodation Query Resubmitted (retry)', JSON.stringify({ team_name, team_lead_email, query_id: existingRecord.id })]
      ).catch(console.error);

      return NextResponse.json({
        success: true,
        id: existingRecord.id,
        price: finalPriceRetry,
        basePrice: basePriceRetry,
        pricingType: pricingTypeRetry,
        totalMembers: total_members,
        nights: nightsRetry,
        message: 'Existing accommodation query updated. Proceeding to payment.',
      });
    }

    // Get pricing settings for a new booking
    const [priceSettings] = await pool.query(
      `SELECT setting_key, setting_value FROM \`hw-settings\` 
       WHERE setting_key IN ('accommodation_price', 'accommodation_pricing_type')`
    );
    
    const settingsMap = {};
    priceSettings.forEach(row => {
      settingsMap[row.setting_key] = row.setting_value;
    });
    
    const basePrice = settingsMap.accommodation_price ? parseFloat(settingsMap.accommodation_price) : 0;
    const pricingType = settingsMap.accommodation_pricing_type || 'per_team';
    
    // Calculate number of nights
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }
    
    // Calculate final price: (price per night × nights) × (per person: members OR per team: 1)
    const priceForNights = basePrice * nights;
    const finalPrice = pricingType === 'per_person' 
      ? priceForNights * total_members 
      : priceForNights;

    // Insert new accommodation query (without payment info - will be added after payment)
    const [result] = await pool.query(
      `INSERT INTO \`hw-accommodation-queries\` 
       (team_name, team_lead_name, team_lead_email, team_lead_phone, total_members, 
        check_in_date, check_out_date, special_requirements, amount, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        team_name,
        team_lead_name,
        team_lead_email,
        team_lead_phone,
        total_members,
        check_in_date,
        check_out_date,
        special_requirements || null,
        finalPrice,
      ]
    );

    // Log the submission
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'Accommodation Query Submitted',
        JSON.stringify({ team_name, team_lead_email, query_id: result.insertId }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      id: result.insertId,
      price: finalPrice,
      basePrice,
      pricingType,
      totalMembers: total_members,
      nights,
      message: 'Accommodation query submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting accommodation query:', error);

    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      tableChecked = false;
      return NextResponse.json(
        { error: 'System is initializing. Please try again in a moment.' },
        { status: 503 }
      );
    }

    // Fallback: catch any duplicate entry that slipped through
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'You already have an accommodation booking. Please refresh the page and try again.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
