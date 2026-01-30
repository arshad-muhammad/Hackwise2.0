import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createTeamSession } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function POST(request) {
  try {
    const { access_key } = await request.json();

    const [teams] = await pool.query(
      'SELECT * FROM `hw-teams` WHERE access_key = ?', 
      [access_key]
    );

    if (teams.length === 0) {
      await logAction('WARN', 'Team login failed - invalid access key', { 
        type: 'TEAM_LOGIN', 
        access_key: access_key?.toUpperCase() || 'MISSING',
        status: 'FAILED'
      });
      return NextResponse.json({ error: 'Invalid access key' }, { status: 401 });
    }

    const team = teams[0];
    
    const token = await createTeamSession({ 
      team_id: team.id, 
      access_key: team.access_key 
    });

    await logAction('INFO', `Team login successful: ${team.team_name || 'Unnamed Team'}`, { 
      type: 'TEAM_LOGIN', 
      team_id: team.id, 
      team_name: team.team_name,
      access_key: team.access_key,
      status: 'SUCCESS'
    });

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('team_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error', error);
    await logAction('ERROR', 'Team login error', { 
      type: 'TEAM_LOGIN', 
      error: error.message 
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
