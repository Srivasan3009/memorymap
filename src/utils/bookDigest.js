// Pure helper: condense a full-book text into a representative digest so the AI
// sees the WHOLE book, not just the first pages. No pdfjs dependency.

//   - keep the opening (title page / table of contents / intro) verbatim
//   - sample evenly-spaced slices from across the entire document
// This preserves the book's chapter structure while staying within the model's
// context window.

export const DIGEST_CHAR_LIMIT = 90000;
const SAMPLE_SLICES = 24;
const SLICE_CHARS = 2600;
const HEAD_CHARS = 22000;

export function buildBookDigest(fullText) {
  const text = String(fullText || '');
  if (text.length <= DIGEST_CHAR_LIMIT) return text;

  const out = [];
  const headLen = Math.min(HEAD_CHARS, text.length);
  out.push(text.slice(0, headLen)); // TOC + early chapters
  out.push('\n\n…[excerpts from the rest of the book]…\n\n');

  const remainder = text.slice(headLen);
  const step = Math.floor(remainder.length / SAMPLE_SLICES);
  const slices = [];
  for (let i = 0; i < SAMPLE_SLICES; i++) {
    const start = i * step;
    const slice = remainder.slice(start, start + SLICE_CHARS).trim();
    if (slice) slices.push(slice);
  }
  // Always include the tail (final chapters / index).
  const tail = remainder.slice(-SLICE_CHARS).trim();
  if (tail && !slices.includes(tail)) slices.push(tail);

  // Deduplicate overlapping boundaries.
  const seen = new Set();
  for (const s of slices) {
    const key = s.slice(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(s);
      out.push('\n\n———\n\n');
    }
  }

  return out.join('').slice(0, DIGEST_CHAR_LIMIT);
}