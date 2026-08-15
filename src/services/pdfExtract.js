import * as pdfjsLib from 'pdfjs-dist';

// In Vite, ?url returns a hashed asset URL we can pass to the worker.
// We set it lazily inside extract so environments that don't resolve ?url
// (e.g. plain Node tests) can still override GlobalWorkerOptions first.
let workerConfigured = false;

async function ensureWorker() {
  if (workerConfigured) return;
  const { default: workerUrl } = await awaitSafeImportWorker();
  if (typeof workerUrl === 'string' && workerUrl) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  }
  workerConfigured = true;
}

function awaitSafeImportWorker() {
  // In Vite this resolves to a hashed asset URL string. In non-bundler
  // environments (plain Node) the ?url specifier may resolve to something
  // else — in which case the caller is expected to have configured the
  // worker already.
  return import('pdfjs-dist/build/pdf.worker.min.mjs?url').catch(() => ({}));
}

// Real client-side PDF text extraction using PDF.js.
// Reads text from every page of the document — works for real books and
// lecture notes, no server needed.

const MAX_PAGES = 80; // avoid freezing the tab on massive scanned textbooks

export async function extractTextFromPdf(file, { onProgress } = {}) {
  await ensureWorker();
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
    useSystemFonts: true
  }).promise;

  const total = Math.min(pdf.numPages, MAX_PAGES);
  const pages = [];

  for (let i = 1; i <= total; i++) {
    if (onProgress) onProgress({ page: i, total });
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => (item.str !== undefined ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  const fullText = pages.join('\n\n');

  // If almost no text came out, the PDF is likely scanned images.
  const textLength = fullText.replace(/\s+/g, '').length;
  if (textLength < 120) {
    throw new PdfTextError(
      'This PDF looks like scanned images (no selectable text). Try a digital PDF, or paste the text instead.'
    );
  }

  return fullText;
}

export class PdfTextError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PdfTextError';
  }
}