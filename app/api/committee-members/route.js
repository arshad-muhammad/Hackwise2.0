import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all active committee members (public route)
export async function GET() {
  try {
    const [members] = await pool.query(
      `SELECT id, name, role, bio, email, linkedin_url, github_url, twitter_url, portfolio_url, image_url
       FROM \`hw-committee-members\` 
       WHERE is_active = TRUE 
       ORDER BY display_order ASC, created_at ASC`
    );
    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

