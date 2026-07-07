/**
 * Middleware untuk melindungi route yang butuh login (JWT).
 * Dipasang di semua endpoint privat: upload CV, riwayat, profile, dst.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token autentikasi tidak ditemukan. Silakan login.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = { username: decoded.username };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Sesi Anda telah berakhir. Silakan login kembali.');
    }
    throw ApiError.unauthorized('Token tidak valid. Silakan login kembali.');
  }
});

module.exports = authMiddleware;
