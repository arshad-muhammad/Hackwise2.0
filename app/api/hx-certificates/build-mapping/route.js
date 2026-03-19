import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MAPPING_FILE = path.join(DATA_DIR, 'certificate-mapping.json');
const PDF_PATH = path.join(process.cwd(), 'public', 'hx-certificates', 'hx-certidicates.pdf');

function extractName(ocrText) {
  const lines = ocrText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // Find name between "Certificate of Participation" and "Awarded"
  let foundCert = false;
  for (const line of lines) {
    if (foundCert) {
      if (line.toLowerCase().startsWith('awarded')) break;
      if (line.length >= 2 && !/certificate|participation|completion/i.test(line)) {
        return line;
      }
    }
    if (/certificate\s+of/i.test(line)) {
      foundCert = true;
    }
  }

  // Fallback: return any line that looks like a name (capitalized, 2-50 chars)
  for (const line of lines) {
    if (
      line.length >= 2 &&
      line.length <= 60 &&
      /^[A-Z]/.test(line) &&
      !/certificate|awarded|participation|completion|officer|title|date|collaboration|sphere|hive|code|three|lines/i.test(line)
    ) {
      return line;
    }
  }

  return null;
}

export async function POST() {
  try {
    if (!fs.existsSync(PDF_PATH)) {
      return NextResponse.json(
        { error: 'Master PDF not found at public/hx-certificates/hx-certidicates.pdf' },
        { status: 404 }
      );
    }

    const { pdf } = await import('pdf-to-img');
    const Tesseract = await import('tesseract.js');

    const pdfBuffer = new Uint8Array(fs.readFileSync(PDF_PATH));
    const doc = await pdf(pdfBuffer, { scale: 2 });

    const scheduler = Tesseract.createScheduler();
    const WORKER_COUNT = 4;

    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = await Tesseract.createWorker('eng');
      scheduler.addWorker(worker);
    }

    const pageImages = [];
    let pageNum = 0;
    for await (const image of doc) {
      pageNum++;
      pageImages.push({ page: pageNum, image: Buffer.from(image) });
    }

    const ocrResults = await Promise.all(
      pageImages.map(async ({ page, image }) => {
        const {
          data: { text },
        } = await scheduler.addJob('recognize', image);
        return { page, text };
      })
    );

    await scheduler.terminate();

    const pages = ocrResults
      .map(({ page, text }) => ({
        page,
        name: extractName(text),
        text: text.replace(/\s+/g, ' ').trim(),
      }))
      .sort((a, b) => a.page - b.page);

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const data = {
      generated_at: new Date().toISOString(),
      total_pages: pages.length,
      pages,
    };

    fs.writeFileSync(MAPPING_FILE, JSON.stringify(data, null, 2));

    const extractedNames = pages.filter((p) => p.name).length;

    return NextResponse.json({
      success: true,
      total_pages: data.total_pages,
      names_extracted: extractedNames,
      generated_at: data.generated_at,
      sample: pages.slice(0, 5).map((p) => ({ page: p.page, name: p.name })),
    });
  } catch (error) {
    console.error('Error building certificate mapping:', error);
    return NextResponse.json(
      { error: 'Failed to build mapping: ' + error.message },
      { status: 500 }
    );
  }
}
