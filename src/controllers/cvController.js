/**
 * Controller untuk upload CV & ekstraksi isinya.
 * Tahap ini FOKUS pada: terima file -> validasi -> ekstrak teks -> kembalikan ke frontend.
 * Penyimpanan riwayat & AI Screening akan ditambahkan pada tahap selanjutnya.
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const logger = require('../utils/logger');
const { extractTextFromFile } = require('../services/fileParserService');
const { deleteTempFile } = require('../utils/fileCleanup');

/**
 * POST /api/cv/upload
 * Multipart form-data, field name: "cv"
 */
const uploadCV = asyncHandler(async (req, res) => {
  const file = req.file;

  try {
    const extraction = await extractTextFromFile(file);

    logger.info('CV berhasil diproses', {
      user: req.user?.username,
      file: file.originalname,
      method: extraction.method,
      wordCount: extraction.wordCount,
    });

    return ApiResponse.success(
      res,
      {
        fileName: file.originalname,
        fileSizeKB: Math.round(file.size / 1024),
        extractionMethod: extraction.method,
        wordCount: extraction.wordCount,
        extractedText: extraction.text,
        // Preview singkat untuk ditampilkan cepat di UI tanpa scroll teks panjang
        preview: extraction.text.slice(0, 400),
      },
      'CV berhasil diproses'
    );
  } finally {
    // File fisik tidak perlu disimpan permanen di tahap ini; hapus setelah dibaca.
    deleteTempFile(file.path);
  }
});

module.exports = { uploadCV };
