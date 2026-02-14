import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import JSZip from 'jszip';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateIdParam = searchParams.get('template_id');

    const templateId = Number(templateIdParam);
    if (!templateId || Number.isNaN(templateId)) {
      return NextResponse.json({ error: 'template_id is required' }, { status: 400 });
    }

    // Load template
    const [tplRows] = await pool.query(
      'SELECT id, name, image_url, image_width, image_height, config FROM `hw-certificate-templates` WHERE id = ? LIMIT 1',
      [templateId]
    );

    if (!tplRows || tplRows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = tplRows[0];
    let config;
    try {
      config =
        typeof template.config === 'string'
          ? JSON.parse(template.config)
          : template.config || {};
    } catch {
      config = {};
    }

    // Load certificates for this template
    const [certRows] = await pool.query(
      'SELECT id, code, recipient_name, team_name FROM `hw-certificates` WHERE template_id = ? ORDER BY created_at ASC, id ASC',
      [templateId]
    );

    if (!certRows || certRows.length === 0) {
      return NextResponse.json(
        { error: 'No certificates found for this template' },
        { status: 404 }
      );
    }

    // Fetch background image once and embed as data URL
    const imgResponse = await fetch(template.image_url);
    if (!imgResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch template image' }, { status: 500 });
    }

    const imgArrayBuffer = await imgResponse.arrayBuffer();
    const imgMime = imgResponse.headers.get('content-type') || 'image/png';
    const imgBase64 = Buffer.from(imgArrayBuffer).toString('base64');
    const imgHref = `data:${imgMime};base64,${imgBase64}`;

    const width = template.image_width || 1920;
    const height = template.image_height || 1080;

    const zip = new JSZip();

    const buildTextSvg = (fieldKey, text) => {
      const cfg = config?.[fieldKey];
      if (!cfg || !text) return '';

      const color = cfg.color || '#000000';
      const fontSize = cfg.fontSize || 32;
      const align = cfg.align || 'left';

      const boxWidthPercent = cfg.boxWidth || 40;
      const boxHeightPercent = cfg.boxHeight || 10;

      const boxXPercent = cfg.x || 0;
      const boxYPercent = cfg.y || 0;

      const boxX = (boxXPercent / 100) * width;
      const boxY = (boxYPercent / 100) * height;
      const boxW = (boxWidthPercent / 100) * width;
      const boxH = (boxHeightPercent / 100) * height;

      let textAnchor = 'start';
      let x = boxX;
      if (align === 'center') {
        textAnchor = 'middle';
        x = boxX + boxW / 2;
      } else if (align === 'right') {
        textAnchor = 'end';
        x = boxX + boxW;
      }
      const y = boxY + boxH / 2;

      const fontFamily =
        cfg.fontFamily === 'monospace'
          ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
          : 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      return `<text x="${x}" y="${y}" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" text-anchor="${textAnchor}" dominant-baseline="middle">${escapeXml(
        text
      )}</text>`;
    };

    for (const cert of certRows) {
      const nameSvg = buildTextSvg('name', cert.recipient_name || '');
      const teamSvg = buildTextSvg('team', cert.team_name || '');
      const codeSvg = buildTextSvg('code', cert.code || '');

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <image href="${imgHref}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" />
  ${nameSvg}
  ${teamSvg}
  ${codeSvg}
</svg>`;

      const safeCode = (cert.code || `cert-${cert.id}`).replace(/[^a-zA-Z0-9-_]/g, '_');
      zip.file(`${safeCode}.svg`, svg);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="template-${templateId}-certificates.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting certificates for template', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

