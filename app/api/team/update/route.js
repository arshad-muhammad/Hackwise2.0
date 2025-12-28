import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyTeamSession } from '@/lib/auth';
import { logAction } from '@/lib/logger';

export async function PUT(request) {
  try {
    const token = request.cookies.get('team_session')?.value;
    const session = await verifyTeamSession(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      team_name, lead_name, lead_email, lead_phone, logo_url, round1_submission_url,
      lead_college, lead_branch, lead_year,
      payment_screenshot_url, transaction_id
    } = body;

    const fields = [];
    const values = [];

    if (team_name !== undefined) { fields.push('team_name = ?'); values.push(team_name); }
    if (lead_name !== undefined) { fields.push('lead_name = ?'); values.push(lead_name); }
    if (lead_email !== undefined) { fields.push('lead_email = ?'); values.push(lead_email); }
    if (lead_phone !== undefined) { fields.push('lead_phone = ?'); values.push(lead_phone); }
    if (logo_url !== undefined) { fields.push('logo_url = ?'); values.push(logo_url); }
    if (round1_submission_url !== undefined) { fields.push('round1_submission_url = ?'); values.push(round1_submission_url); }
    
    // New fields
    if (lead_college !== undefined) { fields.push('lead_college = ?'); values.push(lead_college); }
    if (lead_branch !== undefined) { fields.push('lead_branch = ?'); values.push(lead_branch); }
    if (lead_year !== undefined) { fields.push('lead_year = ?'); values.push(lead_year); }
    
    // Payment fields (Update status to PENDING if submitted)
    if (payment_screenshot_url !== undefined) { 
      fields.push('payment_screenshot_url = ?'); 
      values.push(payment_screenshot_url); 
    }
    if (transaction_id !== undefined) { 
      fields.push('transaction_id = ?'); 
      values.push(transaction_id); 
      // Auto set status to pending review if not already PAID
      // We'll handle this logic in the query construction or separate check, 
      // but simple "set to PENDING" is safe.
      fields.push("payment_status = IF(payment_status = 'PAID', 'PAID', 'PENDING')");
    }

    if (fields.length === 0) return NextResponse.json({ success: true });

    values.push(session.team_id);

    await pool.query(
      `UPDATE \`hw-teams\` SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    await logAction('INFO', `Team updated details: Team ${session.team_id}`, { team_id: session.team_id, updates: body });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update error', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
