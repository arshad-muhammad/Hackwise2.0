import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
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

    // Get pricing settings
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
    
    // Calculate final price based on pricing type
    const finalPrice = pricingType === 'per_person' 
      ? basePrice * total_members 
      : basePrice;

    // Insert accommodation query (without payment info - will be added after payment)
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
      message: 'Accommodation query submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting accommodation query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

