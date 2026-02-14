import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code') || '';

    if (!code.trim()) {
      return NextResponse.json({ error: 'Certificate code is required' }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Load certificate with template info
    const [rows] = await pool.query(
      `SELECT 
         c.id,
         c.code,
         c.recipient_name,
         c.team_name,
         c.template_id,
         t.image_url AS template_image_url,
         t.image_width AS template_image_width,
         t.image_height AS template_image_height,
         t.config AS template_config
       FROM \`hw-certificates\` c
       LEFT JOIN \`hw-certificate-templates\` t ON c.template_id = t.id
       WHERE c.code = ?
       LIMIT 1`,
      [normalizedCode]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const row = rows[0];

    if (!row.template_id || !row.template_image_url || !row.template_config) {
      return NextResponse.json(
        { error: 'This certificate does not have a visual template' },
        { status: 400 }
      );
    }

    // Parse template config
    let config;
    try {
      config =
        typeof row.template_config === 'string'
          ? JSON.parse(row.template_config)
          : row.template_config || {};
    } catch {
      return NextResponse.json({ error: 'Invalid template configuration' }, { status: 500 });
    }

    // Fetch background image
    const imgResponse = await fetch(row.template_image_url);
    if (!imgResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch template image' }, { status: 500 });
    }

    const imgArrayBuffer = await imgResponse.arrayBuffer();
    const width = row.template_image_width || 1920;
    const height = row.template_image_height || 1080;

    // Create PDF
    const pdfDoc = await PDFDocument.create();

    // Embed the background image
    const imageBytes = new Uint8Array(imgArrayBuffer);
    let pdfImage;
    try {
      pdfImage = await pdfDoc.embedPng(imageBytes);
    } catch {
      try {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } catch {
        return NextResponse.json({ error: 'Failed to embed template image' }, { status: 500 });
      }
    }

    // Embed standard fonts
    const helveticaFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
    const courierFont = await pdfDoc.embedStandardFont(StandardFonts.Courier);

    // Helper to convert hex color to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000');
      return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255,
          }
        : { r: 0, g: 0, b: 0 };
    };

    // Helper to draw text field
    const drawTextField = (page, fieldKey, text) => {
      const cfg = config?.[fieldKey];
      if (!cfg || !text) return;

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

      // Get embedded font object
      const font = cfg.fontFamily === 'monospace' ? courierFont : helveticaFont;

      const colorRgb = hexToRgb(color);
      const textColor = rgb(colorRgb.r, colorRgb.g, colorRgb.b);

      // Calculate text position
      // pdf-lib uses bottom-left origin, so we need to flip Y
      const pageHeight = height;
      const centerY = boxY + boxH / 2;
      const y = pageHeight - centerY; // Flip Y coordinate

      // For alignment, we position text at the appropriate x
      let x = boxX;
      if (align === 'center') {
        x = boxX + boxW / 2;
      } else if (align === 'right') {
        x = boxX + boxW;
      }

      // Draw text
      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font: font,
        color: textColor,
      });
    };

    // Create page
    const page = pdfDoc.addPage([width, height]);

    // Draw background image
    page.drawImage(pdfImage, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    // Draw text fields
    drawTextField(page, 'name', row.recipient_name || '');
    drawTextField(page, 'team', row.team_name || '');
    drawTextField(page, 'code', row.code || '');

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // Create safe filename
    const safeName = (row.recipient_name || 'certificate')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const filename = `${safeName}_${normalizedCode}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate PDF', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

