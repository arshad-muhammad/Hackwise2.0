import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Fetch accommodation settings
export async function GET() {
  try {
    const [settings] = await pool.query(
      `SELECT setting_key, setting_value 
       FROM \`hw-settings\` 
       WHERE setting_key IN ('accommodation_enabled', 'accommodation_price', 'accommodation_pricing_type')`
    );

    const settingsMap = {};
    settings.forEach(row => {
      settingsMap[row.setting_key] = row.setting_value;
    });

    return NextResponse.json({
      enabled: settingsMap.accommodation_enabled === '1' || settingsMap.accommodation_enabled === 'true',
      price: settingsMap.accommodation_price ? parseFloat(settingsMap.accommodation_price) : 0,
      pricingType: settingsMap.accommodation_pricing_type || 'per_team', // Default to per_team
    });
  } catch (error) {
    console.error('Error fetching accommodation settings:', error);
    return NextResponse.json({
      enabled: false,
      price: 0,
      pricingType: 'per_team',
    });
  }
}

// PUT: Update accommodation settings (Admin only)
export async function PUT(request) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin session
    const { verifySession } = await import('@/lib/auth');
    if (!(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enabled, price, pricingType } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { error: 'price must be a non-negative number' },
        { status: 400 }
      );
    }

    if (pricingType && !['per_person', 'per_team'].includes(pricingType)) {
      return NextResponse.json(
        { error: 'pricingType must be either "per_person" or "per_team"' },
        { status: 400 }
      );
    }

    // Update settings
    await pool.query(
      `INSERT INTO \`hw-settings\` (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      ['accommodation_enabled', enabled ? '1' : '0', enabled ? '1' : '0']
    );

    await pool.query(
      `INSERT INTO \`hw-settings\` (setting_key, setting_value)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      ['accommodation_price', price.toString(), price.toString()]
    );

    if (pricingType) {
      await pool.query(
        `INSERT INTO \`hw-settings\` (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        ['accommodation_pricing_type', pricingType, pricingType]
      );
    }

    // Log the change
    pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [
        'INFO',
        'Accommodation Settings Updated',
        JSON.stringify({ enabled, price, pricingType }),
      ]
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      enabled,
      price,
      pricingType: pricingType || 'per_team',
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating accommodation settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

