import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function POST(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sender_name, message } = await request.json();

    // Get team name for logging
    const [teamData] = await pool.query('SELECT team_name FROM `hw-teams` WHERE id = ?', [session.team_id]);
    const teamName = teamData[0]?.team_name || 'Unnamed Team';

    await pool.query(
      'INSERT INTO `hw-chat` (team_id, sender_name, message) VALUES (?, ?, ?)',
      [session.team_id, sender_name, message]
    );

    await logAction('INFO', `Team chat message: ${teamName}`, { 
      type: 'TEAM_CHAT', 
      team_id: session.team_id, 
      team_name: teamName,
      sender_name,
      message_length: message?.length || 0
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

