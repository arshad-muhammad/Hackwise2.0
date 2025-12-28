import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function POST(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, email, role, phone, college, branch, year } = await request.json();

    // Check member limit (Max 3 members + 1 lead = 4 total)
    const [currentMembers] = await pool.query(
      'SELECT COUNT(*) as count FROM `hw-team-members` WHERE team_id = ?',
      [session.team_id]
    );

    if (currentMembers[0].count >= 3) {
      return NextResponse.json({ error: 'Maximum team size reached (Lead + 3 Members)' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO `hw-team-members` (team_id, name, email, role, phone, college, branch, year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [session.team_id, name, email, role || 'MEMBER', phone, college, branch, year]
    );

    await logAction('INFO', `Team member added: ${name}`, { team_id: session.team_id, name, email, role });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, name, email, phone, college, branch, year } = body;

    if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });

    await pool.query(
      'UPDATE `hw-team-members` SET name=?, email=?, phone=?, college=?, branch=?, year=? WHERE id=? AND team_id=?',
      [name, email, phone, college, branch, year, id, session.team_id]
    );

    await logAction('INFO', `Team member updated: ${name}`, { team_id: session.team_id, member_id: id, updates: body });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await pool.query(
      'DELETE FROM `hw-team-members` WHERE id = ? AND team_id = ?',
      [id, session.team_id]
    );

    await logAction('WARN', `Team member removed: ${id}`, { team_id: session.team_id, member_id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
