export const MAX_FILE_MB = 50;
export const SUPPORTED_EXTS = /\.(pdf)$/i;

export function validateFile(file) {
  if (!SUPPORTED_EXTS.test(file.name)) {
    return { ok: false, message: 'Unsupported file. Please upload a PDF.' };
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return { ok: false, message: `File too large (max ${MAX_FILE_MB} MB). Try a smaller PDF or paste the text.` };
  }
  return { ok: true };
}