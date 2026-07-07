/**
 * Rate limiter untuk mencegah brute-force pada endpoint login
 * dan membatasi request berlebihan secara umum.
 */
const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Coba lagi nanti.',
  },
});

// Lebih ketat khusus untuk login, supaya sulit di-brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 percobaan login per 15 menit per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.',
  },
});

// Endpoint AI screening memanggil API AI berbayar (OpenAI/Claude),
// dibatasi lebih ketat supaya tidak boros kuota/biaya.
const screeningLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 20, // maksimal 20 kali screening per jam per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas penggunaan AI Screening tercapai. Coba lagi dalam 1 jam.',
  },
});

module.exports = { generalLimiter, loginLimiter, screeningLimiter };
