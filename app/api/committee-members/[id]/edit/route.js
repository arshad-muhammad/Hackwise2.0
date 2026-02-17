import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Update a member's public portfolio fields with password protection
export async function PUT(request, { params }) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams || {};

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const memberId = parseInt(id, 10);
    if (isNaN(memberId) || memberId <= 0) {
      return NextResponse.json({ error: 'Invalid member ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      password,
      verifyOnly,
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
      portfolio_url,
      resume_url,
      linkedin_url,
      github_url,
      twitter_url,
      image_url,
      new_password,
    } = body;

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 401 });
    }

    const [rows] = await pool.query(
      'SELECT edit_password FROM `hw-committee-members` WHERE id = ?',
      [memberId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const storedPassword = rows[0].edit_password || '@ArshadIsBest';
    if (password !== storedPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // If this is only a password verification request, return success early
    if (verifyOnly) {
      return NextResponse.json({ success: true });
    }

    // Build dynamic update set for allowed fields only
    const fields = [];
    const values = [];

    const addField = (column, value) => {
      if (value !== undefined) {
        fields.push(`${column} = ?`);
        values.push(value || null);
      }
    };

    addField('name', name);
    addField('role', role);
    addField('headline', headline);
    addField('location', location);
    addField('short_bio', short_bio);
    addField('bio', bio);
    addField('interests', interests);
    addField('career_objective', career_objective);
    addField('skills', skills);
    addField('tech_skills', tech_skills);
    addField('soft_skills', soft_skills);
    addField('tools', tools);
    addField('achievements', achievements);
    addField('experience', experience);
    addField('projects', projects);
    addField('projects_detail', projects_detail);
    addField('certifications', certifications);
    addField('education', education);
    addField('portfolio_url', portfolio_url);
    addField('resume_url', resume_url);
    addField('linkedin_url', linkedin_url);
    addField('github_url', github_url);
    addField('twitter_url', twitter_url);
    addField('image_url', image_url);
    if (new_password !== undefined) {
      addField('edit_password', new_password || '@ArshadIsBest');
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(memberId);

    const sql = `UPDATE \`hw-committee-members\` SET ${fields.join(
      ', '
    )} WHERE id = ?`;

    await pool.query(sql, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update member portfolio error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}


