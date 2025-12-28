import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createTeamSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const { access_key } = await request.json();

    const [teams] = await pool.query(
      'SELECT * FROM `hw-teams` WHERE access_key = ?', 
      [access_key]
    );

    if (teams.length === 0) {
      return NextResponse.json({ error: 'Invalid access key' }, { status: 401 });
    }

    const team = teams[0];
    
    const token = await createTeamSession({ 
      team_id: team.id, 
      access_key: team.access_key 
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
