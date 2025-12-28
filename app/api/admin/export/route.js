import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Fetch all teams and their members
    const [rows] = await pool.query(`
      SELECT 
        t.id as team_id,
        t.team_name,
        t.logo_url,
        t.payment_status,
        t.lead_name,
        t.lead_email,
        t.lead_phone,
        t.lead_college,
        t.lead_branch,
        t.lead_year,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        m.college as member_college,
        m.branch as member_branch,
        m.year as member_year,
        m.role as member_role
      FROM \`hw-teams\` t
      LEFT JOIN \`hw-team-members\` m ON t.id = m.team_id
      ORDER BY t.id, m.role
    `);

    // Prepare CSV Content
    const headers = [
      'Sl No', 
      'Team Name', 
      'Logo URL', 
      'Name', 
      'Role', 
      'Phone', 
      'Email', 
      'College', 
      'Branch', 
      'Year', 
      'Payment Verification Status'
    ];

    const csvRows = [headers.join(',')];

    let currentSlNo = 0;
    let lastTeamId = null;

    // Process rows
    // Note: The query returns a row per member. For the Lead, we use lead_* fields from team table if member record missing, 
    // but usually lead is not in member table in our schema? 
    // Wait, let's check schema: lead info is in hw-teams, members in hw-team-members.
    // So we need to normalize. 
    // The previous design implies lead is stored in `hw-teams` columns, and OTHER members in `hw-team-members`.
    // So we iterate teams, print lead row, then print member rows.

    // Let's refetch differently to handle this structure cleanly.
    // We will fetch all teams, and for each team, fetch members. 
    // OR better: use the join but realize lead is separate.
    
    // Actually, let's fetch teams and members separately to avoid duplicate team data or missing lead rows if we only relied on join.
    // Wait, the JOIN above gives rows for members. Leads are columns in `hw-teams`.
    // So for each unique team_id in result, we must first output the Lead row, then output the Member rows (from the join).
    
    // Improved Query: Just get teams, and we'll do a second query for members, or just one big query and process in JS.
    const [teams] = await pool.query('SELECT * FROM `hw-teams`');
    const [members] = await pool.query('SELECT * FROM `hw-team-members`');

    teams.forEach((team, index) => {
        const slNo = index + 1;
        
        // 1. Lead Row
        csvRows.push([
            slNo,
            `"${team.team_name || ''}"`,
            `"${team.logo_url || ''}"`,
            `"${team.lead_name || ''}"`,
            'LEAD',
            `"${team.lead_phone || ''}"`,
            `"${team.lead_email || ''}"`,
            `"${team.lead_college || ''}"`,
            `"${team.lead_branch || ''}"`,
            `"${team.lead_year || ''}"`,
            `"${team.payment_status || 'PENDING'}"`
        ].join(','));

        // 2. Member Rows
        const teamMembers = members.filter(m => m.team_id === team.id);
        teamMembers.forEach(member => {
             csvRows.push([
                slNo, // Same SL No for grouping or blank? User asked for SL No. Usually same for team.
                `"${team.team_name || ''}"`,
                `"${team.logo_url || ''}"`,
                `"${member.name || ''}"`,
                'MEMBER',
                `"${member.phone || ''}"`,
                `"${member.email || ''}"`,
                `"${member.college || ''}"`,
                `"${member.branch || ''}"`,
                `"${member.year || ''}"`,
                `"${team.payment_status || 'PENDING'}"`
            ].join(','));
        });
    });

    const csvString = csvRows.join('\n');

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="teams_export_${Date.now()}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

