/**
 * Validasi input untuk endpoint AI Screening.
 * Mencegah teks kosong/terlalu pendek (hasil ekstraksi gagal) atau terlalu panjang (boros token AI).
 */
const validator = require('validator');
const ApiError = require('../utils/ApiError');

const MIN_TEXT_LENGTH = 30;
const MAX_TEXT_LENGTH = 20000; // batas aman untuk konteks AI & biaya token

function validateScreeningInput(req, res, next) {
  const { cvText, targetPosition, aiProvider } = req.body || {};

  if (!cvText || typeof cvText !== 'string') {
    throw ApiError.badRequest('cvText wajib diisi dan berupa teks hasil ekstraksi CV');
  }

  const trimmed = cvText.trim();

  if (trimmed.length < MIN_TEXT_LENGTH) {
    throw ApiError.badRequest('Isi CV terlalu pendek untuk dianalisis. Upload ulang CV Anda.');
  }

  if (trimmed.length > MAX_TEXT_LENGTH) {
    req.body.cvText = trimmed.slice(0, MAX_TEXT_LENGTH);
  } else {
    req.body.cvText = trimmed;
  }

  if (targetPosition) {
    if (typeof targetPosition !== 'string' || targetPosition.length > 150) {
      throw ApiError.badRequest('Posisi target tidak valid (maksimal 150 karakter)');
    }
    req.body.targetPosition = validator.escape(validator.trim(targetPosition));
  }

  if (aiProvider && !['openai', 'claude', 'gemini'].includes(String(aiProvider).toLowerCase())) {
    throw ApiError.badRequest('aiProvider harus "openai", "claude", atau "gemini"');
  }

  next();
}

module.exports = { validateScreeningInput };
