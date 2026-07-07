/**
 * Konstanta terpusat untuk validasi file upload CV.
 * Dipakai oleh uploadMiddleware dan fileParserService supaya konsisten.
 */
const ALLOWED_MIME_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
};

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

module.exports = { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS };
