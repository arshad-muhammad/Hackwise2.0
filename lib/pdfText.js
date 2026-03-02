// Utilities to make pdf-lib text rendering resilient with StandardFonts (WinAnsi encoding).
// In production we often see invisible bidi control characters (e.g. U+202C) pasted into form fields,
// which can crash PDF generation with: "WinAnsi cannot encode ...".

const BIDI_CONTROL_CHARS_REGEX = /[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const ASCII_PRINTABLE_REGEX = /[^\x20-\x7E]/g;
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;

export function sanitizePdfText(value) {
  if (value === null || value === undefined) return '';

  // Normalize to reduce weird combining sequences (doesn't remove any information)
  // and strip characters known to break WinAnsi encoding.
  return String(value)
    .normalize('NFC')
    .replace(BIDI_CONTROL_CHARS_REGEX, '')
    .replace(CONTROL_CHARS_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toAsciiFallback(value) {
  return sanitizePdfText(value).replace(ASCII_PRINTABLE_REGEX, '').trim();
}

/**
 * Draws text safely with pdf-lib StandardFonts.
 * Tries the sanitized string first; if the font encoding still rejects it,
 * falls back to ASCII-only so invoice generation never crashes.
 */
export function safeDrawText(page, text, options) {
  const cleaned = sanitizePdfText(text);
  try {
    page.drawText(cleaned, options);
  } catch (err) {
    const ascii = toAsciiFallback(cleaned);
    page.drawText(ascii, options);
  }
}


