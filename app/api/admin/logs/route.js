import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function ensureLogsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`hw-logs\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        level VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        details JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch {
    // Table already exists or DB unreachable — handled below
  }
}

export async function GET() {
  try {
    await ensureLogsTable();
    const [rows] = await pool.query('SELECT * FROM `hw-logs` ORDER BY created_at DESC LIMIT 100');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Admin logs error:', error.message);
    // Return empty array instead of 500 so the admin UI doesn't break
    return NextResponse.json([]);
  }
}
