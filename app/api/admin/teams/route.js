import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
        // Fetch detailed info for a single team including members
        const [teams] = await pool.query('SELECT * FROM `hw-teams` WHERE id = ?', [id]);
        if (teams.length === 0) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
        
        const [members] = await pool.query('SELECT * FROM `hw-team-members` WHERE team_id = ?', [id]);
        
        return NextResponse.json({ ...teams[0], members });
    }

    // List all teams (summary)
    const [teams] = await pool.query('SELECT * FROM `hw-teams` ORDER BY created_at DESC');
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { team_name } = await request.json();
    
    const access_key = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const [result] = await pool.query(
      'INSERT INTO `hw-teams` (team_name, access_key) VALUES (?, ?)',
      [team_name, access_key]
    );

    await logAction('INFO', `Team created: ${team_name}`, { team_id: result.insertId, team_name, access_key });

    return NextResponse.json({ 
      id: result.insertId, 
      team_name, 
      access_key 
    });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
