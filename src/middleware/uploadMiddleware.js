/**
 * Middleware upload file CV menggunakan Multer.
 * - Validasi tipe file (PDF, DOCX, JPG, JPEG, PNG)
 * - Validasi ukuran maksimal (default 20MB, lihat MAX_FILE_SIZE_MB di .env)
 * - File disimpan sementara di folder temp bawaan OS (BUKAN di dalam folder aplikasi),
 *   karena banyak platform hosting (Railway/Render/SnapDeploy/dll) tidak mengizinkan
 *   aplikasi menulis file baru di dalam folder project-nya sendiri (read-only filesystem).
 *   File akan dihapus otomatis setelah selesai diparsing (lihat cvController.js).
 */
const multer = require('multer');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } = require('../utils/fileConstants');

const UPLOAD_DIR = path.join(os.tmpdir(), 'cv-ats-uploads');

// Pastikan folder upload sementara ada. Dibungkus try/catch supaya kalau GAGAL
// (misal permission terbatas), aplikasi tidak crash total saat start up —
// error baru akan muncul saat ada yang benar-benar upload file (lebih mudah dilacak).
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (error) {
  logger.error('Gagal membuat folder upload sementara', {
    UPLOAD_DIR,
    message: error.message,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = Object.prototype.hasOwnProperty.call(ALLOWED_MIME_TYPES, file.mimetype);
  const extOk = ALLOWED_EXTENSIONS.includes(ext);

  if (!mimeOk || !extOk) {
    return cb(
      ApiError.badRequest(
        `Format file tidak didukung. Gunakan salah satu: ${ALLOWED_EXTENSIONS.join(', ')}`
      )
    );
  }
  cb(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 1,
  },
});

/**
 * Wrapper agar error dari Multer (MulterError) diubah jadi ApiError
 * supaya format response error tetap konsisten di seluruh aplikasi.
 */
function uploadSingleCV(req, res, next) {
  multerUpload.single('cv')(req, res, (err) => {
    if (!err) {
      if (!req.file) {
        return next(ApiError.badRequest('File CV wajib diupload'));
      }
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(
          ApiError.badRequest(`Ukuran file maksimal ${env.MAX_FILE_SIZE_MB}MB`)
        );
      }
      return next(ApiError.badRequest(`Upload gagal: ${err.message}`));
    }

    // Error custom dari fileFilter (sudah berupa ApiError)
    return next(err);
  });
}

module.exports = { uploadSingleCV, UPLOAD_DIR };
