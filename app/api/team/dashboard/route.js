import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id } = session;

    // Fetch Team Details
    const [teams] = await pool.query('SELECT * FROM `hw-teams` WHERE id = ?', [team_id]);
    const team = teams[0];

    // Fetch Members
    const [members] = await pool.query('SELECT * FROM `hw-team-members` WHERE team_id = ?', [team_id]);

    // Fetch Announcements (Global or Targeted)
    const [announcements] = await pool.query(`
      SELECT * FROM \`hw-announcements\` 
      WHERE target_team_id IS NULL OR target_team_id = ?
      ORDER BY created_at DESC
    `, [team_id]);

    // Fetch recent chat (limit 50)
    const [chat] = await pool.query(`
      SELECT * FROM \`hw-chat\` 
      WHERE team_id = ? 
      ORDER BY created_at ASC
    `, [team_id]);

    return NextResponse.json({
      team,
      members,
      announcements,
      chat
    });

  } catch (error) {
    console.error('Dashboard fetch error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
