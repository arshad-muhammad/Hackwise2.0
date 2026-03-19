import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

const DATA_DIR = path.join(process.cwd(), 'data');
const MAPPING_FILE = path.join(DATA_DIR, 'certificate-mapping.json');
const PDF_PATH = path.join(process.cwd(), 'public', 'hx-certificates', 'hx-certidicates.pdf');

let cachedMapping = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function getMapping() {
  const now = Date.now();
  if (cachedMapping && now - cacheTimestamp < CACHE_TTL) {
    return cachedMapping;
  }

  if (!fs.existsSync(MAPPING_FILE)) {
    return null;
  }

  cachedMapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf-8'));
  cacheTimestamp = now;
  return cachedMapping;
}

function findPage(mapping, searchName) {
  const normalized = searchName.trim().toLowerCase().replace(/\s+/g, ' ');

  // Try exact name match first (fastest)
  for (const entry of mapping.pages) {
    if (entry.name && entry.name.toLowerCase().replace(/\s+/g, ' ') === normalized) {
      return entry;
    }
  }

  // Try name contains match
  for (const entry of mapping.pages) {
    if (entry.name && entry.name.toLowerCase().replace(/\s+/g, ' ').includes(normalized)) {
      return entry;
    }
  }

  // Fallback: search the full OCR text
  for (const entry of mapping.pages) {
    if (entry.text && entry.text.toLowerCase().replace(/\s+/g, ' ').includes(normalized)) {
      return entry;
    }
  }

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!fs.existsSync(PDF_PATH)) {
      return NextResponse.json({ error: 'Certificate PDF not available' }, { status: 404 });
    }

    const mapping = await getMapping();

    if (!mapping) {
      return NextResponse.json(
        { error: 'Certificate index has not been built yet. Please contact the admin.' },
        { status: 503 }
      );
    }

    const match = findPage(mapping, name);

    if (!match) {
      return NextResponse.json(
        { error: 'Certificate not found. Please check the spelling of your name.' },
        { status: 404 }
      );
    }

    const pdfBuffer = fs.readFileSync(PDF_PATH);
    const sourcePdf = await PDFDocument.load(pdfBuffer);
    const newPdf = await PDFDocument.create();

    const [copiedPage] = await newPdf.copyPages(sourcePdf, [match.page - 1]);
    newPdf.addPage(copiedPage);

    const pdfBytes = await newPdf.save();
    const sanitizedName = name
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate_${sanitizedName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return NextResponse.json(
      { error: 'Failed to process certificate request' },
      { status: 500 }
    );
  }
}
