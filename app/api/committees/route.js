import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET all active committees with their members (public route)
export async function GET() {
  try {
    const [committees] = await pool.query(
      `SELECT id, name, description, display_order
       FROM \`hw-committees\` 
       WHERE is_active = TRUE 
       ORDER BY display_order ASC, created_at ASC`
    );

    // Fetch members for each committee
    const committeesWithMembers = await Promise.all(
      committees.map(async (committee) => {
        const [members] = await pool.query(
          `SELECT id, name, role, bio, email, linkedin_url, github_url, twitter_url, portfolio_url, image_url
           FROM \`hw-committee-members\` 
           WHERE committee_id = ? AND is_active = TRUE 
           ORDER BY display_order ASC, created_at ASC`,
          [committee.id]
        );
        return {
          ...committee,
          members: members || [],
        };
      })
    );

    // Also fetch members without a committee (for backward compatibility)
    const [unassignedMembers] = await pool.query(
      `SELECT id, name, role, bio, email, linkedin_url, github_url, twitter_url, portfolio_url, image_url
       FROM \`hw-committee-members\` 
       WHERE (committee_id IS NULL OR committee_id = 0) AND is_active = TRUE 
       ORDER BY display_order ASC, created_at ASC`
    );

    return NextResponse.json({
      committees: committeesWithMembers,
      unassignedMembers: unassignedMembers || [],
    });
  } catch (error) {
    console.error('Get committees error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

