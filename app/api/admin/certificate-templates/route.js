import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logAction } from '@/lib/logger';

// GET: list all certificate templates
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, type, image_url, image_width, image_height, config, created_at, updated_at FROM `hw-certificate-templates` ORDER BY created_at DESC, id DESC'
    );

    // Ensure config is parsed as JSON on the way out
    const templates = (rows || []).map((row) => {
      let parsedConfig = null;
      try {
        if (row.config && typeof row.config === 'string') {
          parsedConfig = JSON.parse(row.config);
        } else {
          parsedConfig = row.config || null;
        }
      } catch {
        parsedConfig = null;
      }

      return {
        ...row,
        config: parsedConfig,
      };
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching certificate templates', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// POST: create a new certificate template
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      type = 'OTHER',
      image_url,
      image_width,
      image_height,
      config,
    } = body;

    if (!name || !image_url || !config) {
      return NextResponse.json(
        { error: 'Name, image URL and config are required' },
        { status: 400 }
      );
    }

    const allowedTypes = ['PARTICIPANT', 'WINNER', 'OTHER'];
    const normalizedType = allowedTypes.includes(type) ? type : 'OTHER';

    const [result] = await pool.query(
      `INSERT INTO \`hw-certificate-templates\`
       (name, type, image_url, image_width, image_height, config)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        normalizedType,
        image_url,
        image_width || null,
        image_height || null,
        JSON.stringify(config || {}),
      ]
    );

    const insertedId = result.insertId;

    await logAction('INFO', 'Certificate template created', {
      template_id: insertedId,
      name,
      type: normalizedType,
    });

    return NextResponse.json({
      success: true,
      template: {
        id: insertedId,
        name,
        type: normalizedType,
        image_url,
        image_width: image_width || null,
        image_height: image_height || null,
        config,
      },
    });
  } catch (error) {
    console.error('Error creating certificate template', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// PUT: update an existing certificate template
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      type = 'OTHER',
      image_url,
      image_width,
      image_height,
      config,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    if (!name || !image_url || !config) {
      return NextResponse.json(
        { error: 'Name, image URL and config are required' },
        { status: 400 }
      );
    }

    const allowedTypes = ['PARTICIPANT', 'WINNER', 'OTHER'];
    const normalizedType = allowedTypes.includes(type) ? type : 'OTHER';

    await pool.query(
      `UPDATE \`hw-certificate-templates\`
       SET name = ?, type = ?, image_url = ?, image_width = ?, image_height = ?, config = ?
       WHERE id = ?`,
      [
        name,
        normalizedType,
        image_url,
        image_width || null,
        image_height || null,
        JSON.stringify(config || {}),
        id,
      ]
    );

    await logAction('INFO', 'Certificate template updated', {
      template_id: id,
      name,
      type: normalizedType,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating certificate template', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// DELETE: remove a certificate template
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    await pool.query('DELETE FROM `hw-certificate-templates` WHERE id = ?', [id]);

    await logAction('WARN', 'Certificate template deleted', {
      template_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting certificate template', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}


