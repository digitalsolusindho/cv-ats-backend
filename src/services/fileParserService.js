/**
 * Service inti untuk membaca isi CV dari berbagai format file.
 *
 * - PDF   -> pdf-parse (ekstraksi teks langsung dari struktur PDF)
 * - DOCX  -> mammoth (ekstraksi teks dari dokumen Word)
 * - Image -> tesseract.js (OCR, mengubah gambar jadi teks)
 *
 * Fungsi utama `extractTextFromFile` dipanggil oleh cvController tanpa perlu
 * tahu detail library apa yang dipakai di baliknya (mudah diganti nanti).
 */
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const { ALLOWED_MIME_TYPES } = require('../utils/fileConstants');

async function extractFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text;
}

async function extractFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function extractFromImage(filePath) {
  const result = await Tesseract.recognize(filePath, env.OCR_LANGUAGES);
  return result.data.text;
}

/**
 * Membaca isi file CV berdasarkan tipe file-nya, lalu mengembalikan teks bersih.
 * @param {{ path: string, mimetype: string, originalname: string }} file - object file dari Multer
 * @returns {Promise<{ text: string, method: string, wordCount: number }>}
 */
async function extractTextFromFile(file) {
  const kind = ALLOWED_MIME_TYPES[file.mimetype];

  if (!kind) {
    throw ApiError.badRequest('Tipe file tidak dikenali oleh sistem parsing');
  }

  let rawText = '';
  let method = '';

  try {
    switch (kind) {
      case 'pdf':
        rawText = await extractFromPdf(file.path);
        method = 'PDF Parser';
        break;
      case 'docx':
        rawText = await extractFromDocx(file.path);
        method = 'DOCX Parser (Mammoth)';
        break;
      case 'image':
        rawText = await extractFromImage(file.path);
        method = 'OCR (Tesseract)';
        break;
      default:
        throw ApiError.badRequest('Tipe file tidak didukung');
    }
  } catch (error) {
    if (error.isApiError) throw error;
    logger.error('Gagal mengekstrak teks dari file', {
      file: file.originalname,
      message: error.message,
    });
    throw ApiError.internal(
      `Gagal membaca isi file "${file.originalname}". File mungkin rusak, terenkripsi, atau kualitas gambar terlalu rendah untuk OCR.`
    );
  }

  const cleanText = normalizeText(rawText);

  if (!cleanText || cleanText.length < 30) {
    throw ApiError.badRequest(
      'Isi CV tidak dapat terbaca dengan cukup jelas. Pastikan file bukan hasil scan kualitas rendah, dan bukan file kosong/terkunci.'
    );
  }

  return {
    text: cleanText,
    method,
    wordCount: cleanText.split(/\s+/).filter(Boolean).length,
  };
}

/**
 * Membersihkan teks hasil ekstraksi: merapikan baris kosong berlebih & spasi ganda.
 */
function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { extractTextFromFile };
