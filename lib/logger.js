import pool from '@/lib/db';

export async function logAction(level, message, details = null) {
  try {
    await pool.query(
      'INSERT INTO `hw-logs` (level, message, details) VALUES (?, ?, ?)',
      [level, message, JSON.stringify(details)]
    );
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

