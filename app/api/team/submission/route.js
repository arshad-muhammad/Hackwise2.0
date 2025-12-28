import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function GET(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Check if submission is allowed
    const [settings] = await pool.query("SELECT setting_value FROM `hw-settings` WHERE setting_key = 'project_submission_enabled'");
    const isEnabled = settings[0]?.setting_value === 'true';

    // 2. Fetch existing submission
    const [submissions] = await pool.query('SELECT * FROM `hw-project-submissions` WHERE team_id = ?', [session.team_id]);
    
    return NextResponse.json({ 
        isOpen: isEnabled,
        submission: submissions[0] || null 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if submission is allowed
    const [settings] = await pool.query("SELECT setting_value FROM `hw-settings` WHERE setting_key = 'project_submission_enabled'");
    if (settings[0]?.setting_value !== 'true') {
        return NextResponse.json({ error: 'Submissions are currently closed' }, { status: 403 });
    }

    const body = await request.json();
    const { description, github_link, live_link, ppt_url, source_code_url } = body;

    // Upsert submission
    await pool.query(`
      INSERT INTO \`hw-project-submissions\` 
      (team_id, description, github_link, live_link, ppt_url, source_code_url)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      description = VALUES(description),
      github_link = VALUES(github_link),
      live_link = VALUES(live_link),
      ppt_url = VALUES(ppt_url),
      source_code_url = VALUES(source_code_url)
    `, [session.team_id, description, github_link, live_link, ppt_url, source_code_url]);

    await logAction('INFO', `Project submission updated: Team ${session.team_id}`, { team_id: session.team_id, updates: body });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

