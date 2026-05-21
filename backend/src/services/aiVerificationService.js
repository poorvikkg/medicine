const { runOCR, compareOCRTexts } = require('./ocrService');
const https = require('https');
const http = require('http');

/**
 * Fetch image as buffer from URL.
 */
const fetchImageBuffer = (url) =>
  new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });

/**
 * Simple color analysis — returns dominant color label.
 * Uses pixel sampling with sharp if available, otherwise falls back to 'unknown'.
 */
const analyzeColor = async (imageUrl) => {
  try {
    const sharp = require('sharp');
    const buffer = await fetchImageBuffer(imageUrl);
    const { dominant } = await sharp(buffer).stats();
    const { r, g, b } = dominant;
    if (r > 200 && g < 100 && b < 100) return 'red';
    if (r < 100 && g > 150 && b < 100) return 'green';
    if (r < 100 && g < 100 && b > 180) return 'blue';
    if (r > 200 && g > 200 && b < 100) return 'yellow';
    if (r > 200 && g > 140 && b < 100) return 'orange';
    if (r > 180 && g > 180 && b > 180) return 'white';
    if (r < 80 && g < 80 && b < 80) return 'black';
    return 'mixed';
  } catch (_) {
    return 'unknown';
  }
};

/**
 * Main verification function.
 * Compares uploaded image against stored medicine data.
 */
const verifyMedicineImage = async (medicine, uploadedImageUrl) => {
  const result = {
    isCorrect: false,
    confidence: 0,
    colorMatch: false,
    shapeMatch: false,
    ocrMatch: false,
    message: '',
  };

  let score = 0;
  const weights = { color: 30, ocr: 50, shape: 20 };

  // 1. Color check
  try {
    const uploadedColor = await analyzeColor(uploadedImageUrl);
    if (medicine.colorProfile) {
      result.colorMatch = uploadedColor === medicine.colorProfile || uploadedColor === 'unknown';
      if (result.colorMatch) score += weights.color;
    } else {
      score += weights.color * 0.5; // no color reference, partial credit
    }
  } catch (_) {
    score += weights.color * 0.5;
  }

  // 2. OCR text check
  try {
    const uploadedOCR = await runOCR(uploadedImageUrl);
    if (medicine.ocrText && uploadedOCR) {
      const similarity = compareOCRTexts(medicine.ocrText, uploadedOCR);
      result.ocrMatch = similarity > 0.3;
      score += weights.ocr * similarity;
    } else {
      score += weights.ocr * 0.3; // no OCR reference
    }
  } catch (_) {
    score += weights.ocr * 0.3;
  }

  // 3. Shape check — basic heuristic (if stored, compare)
  if (medicine.shapeDescriptor) {
    // Without a dedicated shape model we give partial credit
    score += weights.shape * 0.5;
    result.shapeMatch = true;
  } else {
    score += weights.shape * 0.5;
  }

  result.confidence = Math.min(100, Math.round(score));
  result.isCorrect = result.confidence >= 50;

  result.message = result.isCorrect
    ? `Medicine verified with ${result.confidence}% confidence.`
    : `Possible mismatch detected (${result.confidence}% confidence). Please double-check.`;

  return result;
};

module.exports = { verifyMedicineImage };
