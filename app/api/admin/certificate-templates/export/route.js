import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import JSZip from 'jszip';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeXmlAttribute(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
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
    const format = searchParams.get('format') || 'svg'; // 'svg' or 'pdf'

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
    // Clean MIME type - remove any parameters (like charset) that might break XML
    const rawMime = imgResponse.headers.get('content-type') || 'image/png';
    const imgMime = rawMime.split(';')[0].trim(); // Get just the MIME type part
    const imgBase64 = Buffer.from(imgArrayBuffer).toString('base64');
    const imgHref = `data:${imgMime};base64,${imgBase64}`;

    const width = template.image_width || 1920;
    const height = template.image_height || 1080;

    // Convert pixels to PDF points (assuming 72 DPI, 1 pixel = 1 point)
    // For better quality, we can scale, but for now 1:1 is fine
    const pdfWidth = width;
    const pdfHeight = height;

    // If PDF format, generate PDF directly
    if (format === 'pdf') {
      const pdfDoc = await PDFDocument.create();

      // Embed the background image once
      const imageBytes = new Uint8Array(imgArrayBuffer);
      let pdfImage;
      try {
        // Try PNG first
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } catch {
        // If PNG fails, try JPG
        try {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } catch {
          // If both fail, we'll need to handle this error
          return NextResponse.json({ error: 'Failed to embed template image' }, { status: 500 });
        }
      }

      // Embed standard fonts once (pdf-lib requires PDFFont objects, not strings)
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

        const boxX = (boxXPercent / 100) * pdfWidth;
        const boxY = (boxYPercent / 100) * pdfHeight;
        const boxW = (boxWidthPercent / 100) * pdfWidth;
        const boxH = (boxHeightPercent / 100) * pdfHeight;

        // Get embedded font object
        const font = cfg.fontFamily === 'monospace' ? courierFont : helveticaFont;

        const colorRgb = hexToRgb(color);
        const textColor = rgb(colorRgb.r, colorRgb.g, colorRgb.b);

        // Calculate text position
        // pdf-lib uses bottom-left origin, so we need to flip Y
        const pageHeight = pdfHeight;
        const centerY = boxY + boxH / 2;
        const y = pageHeight - centerY; // Flip Y coordinate

        // For alignment, we position text at the appropriate x
        // Note: pdf-lib doesn't have built-in text alignment, so we approximate
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

      // Create a page for each certificate
      for (const cert of certRows) {
        const page = pdfDoc.addPage([pdfWidth, pdfHeight]);

        // Draw background image
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfWidth,
          height: pdfHeight,
        });

        // Draw text fields
        drawTextField(page, 'name', cert.recipient_name || '');
        drawTextField(page, 'team', cert.team_name || '');
        drawTextField(page, 'code', cert.code || '');
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="template-${templateId}-certificates.pdf"`,
        },
      });
    }

    // SVG format (default) - generate ZIP with individual SVG files
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

      const escapedText = escapeXml(text);
      const escapedColor = escapeXmlAttribute(color);
      const escapedFontFamily = escapeXmlAttribute(fontFamily);

      return `<text x="${Number(x).toFixed(2)}" y="${Number(y).toFixed(2)}" fill="${escapedColor}" font-size="${Number(fontSize)}" font-family="${escapedFontFamily}" text-anchor="${textAnchor}" dominant-baseline="middle">${escapedText}</text>`;
    };

    for (const cert of certRows) {
      const nameSvg = buildTextSvg('name', cert.recipient_name || '');
      const teamSvg = buildTextSvg('team', cert.team_name || '');
      const codeSvg = buildTextSvg('code', cert.code || '');

      // Data URLs are safe in XML attributes when properly quoted, but we need to escape any & characters
      // Base64 shouldn't contain &, but the MIME type might have special chars
      const safeImgHref = imgHref.replace(/&/g, '&amp;');
      const svgWidth = Number(width);
      const svgHeight = Number(height);

      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <image href="${safeImgHref}" x="0" y="0" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid slice" />
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

