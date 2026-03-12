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

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
