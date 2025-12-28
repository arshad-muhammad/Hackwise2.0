import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*, 
        t.team_name,
        t.lead_name,
        t.lead_email
      FROM \`hw-project-submissions\` s
      JOIN \`hw-teams\` t ON s.team_id = t.id
      ORDER BY s.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const [result] = await pool.query('DELETE FROM `hw-project-submissions` WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    await logAction('WARN', `Submission deleted (Admin): ${id}`, { submission_id: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
