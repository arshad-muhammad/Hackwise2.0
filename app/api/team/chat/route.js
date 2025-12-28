import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sender_name, message } = await request.json();

    await pool.query(
      'INSERT INTO `hw-chat` (team_id, sender_name, message) VALUES (?, ?, ?)',
      [session.team_id, sender_name, message]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

