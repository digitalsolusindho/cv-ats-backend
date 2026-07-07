/**
 * Middleware global untuk menangkap semua error di aplikasi
 * dan mengembalikan response JSON yang konsisten.
 * Harus didaftarkan PALING TERAKHIR di app.js.
 */
const env = require('../config/env');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/ApiResponse');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : 500;
  const message = err.isApiError ? err.message : 'Terjadi kesalahan pada server';

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  } else {
    logger.warn(err.message, { path: req.originalUrl });
  }

  return ApiResponse.error(
    res,
    message,
    statusCode,
    env.isProd() ? null : err.details || null
  );
}

function notFoundHandler(req, res) {
  return ApiResponse.error(res, `Route tidak ditemukan: ${req.originalUrl}`, 404);
}

module.exports = { errorHandler, notFoundHandler };
