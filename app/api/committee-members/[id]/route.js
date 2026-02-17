import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single committee member by ID (public route)
export async function GET(request, { params }) {
  try {
    // Handle params as Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const memberId = parseInt(id, 10);
    if (isNaN(memberId) || memberId <= 0) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const [members] = await pool.query(
      `SELECT 
         id,
         name,
         role,
         headline,
         location,
         short_bio,
         bio,
         interests,
         career_objective,
         skills,
         tech_skills,
         soft_skills,
         tools,
         achievements,
         experience,
         projects,
         projects_detail,
         certifications,
         education,
         email,
         linkedin_url,
         github_url,
         twitter_url,
         portfolio_url,
         resume_url,
         image_url
       FROM \`hw-committee-members\` 
       WHERE id = ? AND is_active = TRUE`,
      [memberId]
    );

    if (members.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ member: members[0] });
  } catch (error) {
    console.error('Get member error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

