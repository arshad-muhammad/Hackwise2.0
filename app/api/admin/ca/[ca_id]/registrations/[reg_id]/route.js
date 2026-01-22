import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifySession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const token = request.cookies.get('admin_session')?.value;
    if (!token || !(await verifySession(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle params as Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { reg_id, ca_id } = resolvedParams || {};

    if (!reg_id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const regIdInt = parseInt(reg_id, 10);

    if (isNaN(regIdInt) || regIdInt <= 0) {
      return NextResponse.json(
        { error: 'Invalid Registration ID' },
        { status: 400 }
      );
    }

    // Get registration details
    const [registrations] = await pool.query(
      'SELECT * FROM `hw-participant-registrations` WHERE id = ?',
      [regIdInt]
    );

    if (registrations.length === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    const registration = registrations[0];

    // Get all team members
    const [members] = await pool.query(
      'SELECT * FROM `hw-participant-members` WHERE registration_id = ? ORDER BY is_team_lead DESC, id ASC',
      [regIdInt]
    );

    return NextResponse.json({
      registration,
      members,
    });
  } catch (error) {
    console.error('Error fetching registration details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

