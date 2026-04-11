/**
 * PDF Service - Extract text content from uploaded PDF files
 */

const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extract text from a PDF file buffer or path
 */
const extractTextFromPDF = async (fileBufferOrPath) => {
  let buffer;

  if (typeof fileBufferOrPath === 'string') {
    // It's a file path
    buffer = fs.readFileSync(fileBufferOrPath);
  } else {
    buffer = fileBufferOrPath;
  }

  const data = await pdfParse(buffer);

  if (!data.text || data.text.trim().length < 100) {
    throw new Error('PDF appears to be empty or contains only images (not extractable text).');
  }

  // Clean up extracted text
  const cleaned = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable chars
    .trim();

  return {
    text: cleaned,
    pages: data.numpages,
    wordCount: cleaned.split(/\s+/).length,
  };
};

module.exports = { extractTextFromPDF };
