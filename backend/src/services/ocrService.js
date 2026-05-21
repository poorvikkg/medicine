const Tesseract = require('tesseract.js');

/**
 * Run OCR on an image URL or local path.
 * Returns extracted text string.
 */
const runOCR = async (imageSource) => {
  try {
    const { data: { text } } = await Tesseract.recognize(imageSource, 'eng', {
      logger: () => {}, // suppress logs
    });
    return text.trim();
  } catch (err) {
    console.error('OCR error:', err.message);
    return '';
  }
};

/**
 * Extract meaningful medicine-related tokens from OCR text.
 */
const extractMedicineTokens = (ocrText) => {
  if (!ocrText) return [];
  // Remove special chars, split on whitespace/newlines
  return ocrText
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .map((t) => t.toLowerCase());
};

/**
 * Compare two OCR texts and return similarity score (0-1).
 */
const compareOCRTexts = (text1, text2) => {
  if (!text1 || !text2) return 0;
  const tokens1 = new Set(extractMedicineTokens(text1));
  const tokens2 = new Set(extractMedicineTokens(text2));
  const intersection = [...tokens1].filter((t) => tokens2.has(t));
  const union = new Set([...tokens1, ...tokens2]);
  return union.size > 0 ? intersection.length / union.size : 0;
};

module.exports = { runOCR, extractMedicineTokens, compareOCRTexts };
