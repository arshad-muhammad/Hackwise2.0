import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function PUT(request, { params }) {
  try {
    const { id } = await params; // Await params for Next.js 15 compatibility
    const body = await request.json();
    
    console.log(`Updating team ${id} with body:`, body);

    const fields = [];
    const values = [];
    
    const allowedFields = [
      'team_name', 'lead_name', 'lead_email', 'lead_phone', 
      'lead_college', 'lead_branch', 'lead_year',
      'logo_url', 'round1_submission_url', 'round1_marks', 
      'round1_feedback', 'payment_status', 'transaction_id', 'payment_screenshot_url'
    ];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      console.warn('No valid fields to update for team', id);
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE \`hw-teams\` SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
        console.warn(`Team ${id} not found or no changes made.`);
    } else {
        await logAction('INFO', `Team ${id} updated (Admin)`, { team_id: id, updates: body });
    }

    return NextResponse.json({ success: true, affectedRows: result.affectedRows });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Database error: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Await params
    await pool.query('DELETE FROM `hw-teams` WHERE id = ?', [id]);
    await logAction('WARN', `Team ${id} deleted (Admin)`, { team_id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
